import { IAuthUser } from "../auth/auth.interface";
import { prisma } from "../../lib/prisma";
import { PaymentProvider, PaymentStatus, RentalStatus, Role } from "../../../prisma/generated/prisma/enums";
import { IConfirmPaymentPayload, ICreatePaymentPayload } from "./payment.interface";

const paymentInclude = {
    rentalOrder: {
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,
                },
            },
            items: {
                include: {
                    gearItem: {
                        include: {
                            category: true,
                            provider: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

import config from "../../config";
import Stripe from "stripe";

const stripe = new Stripe(config.stripe_secret_key as string);

const validateProvider = (provider: PaymentProvider) => {
    if (!Object.values(PaymentProvider).includes(provider)) {
        throw new Error("Invalid payment provider");
    }
};

const validatePaymentStatus = (status: PaymentStatus) => {
    if (!Object.values(PaymentStatus).includes(status)) {
        throw new Error("Invalid payment status");
    }
};

const createPayment = async (customerId: string, payload: ICreatePaymentPayload) => {
    const provider = payload.provider ?? payload.method ?? PaymentProvider.STRIPE;

    if (!payload.rentalOrderId) {
        throw new Error("rentalOrderId is required");
    }

    validateProvider(provider);

    const order = await prisma.rentalOrder.findUnique({
        where: {
            id: payload.rentalOrderId,
        },
        include: {
            payment: true,
        },
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    if (order.customerId !== customerId) {
        throw new Error("Unauthorized to pay for this rental order");
    }

    const unpaidStatuses: RentalStatus[] = [RentalStatus.CANCELLED, RentalStatus.RETURNED];

    if (unpaidStatuses.includes(order.status)) {
        throw new Error("Payment cannot be created for a cancelled or returned order");
    }

    if (order.payment && order.payment.status !== PaymentStatus.PENDING) {
        return order.payment;
    }

    return prisma.$transaction(async (tx) => {
        let paymentRecord;

        if (order.payment) {
            paymentRecord = await tx.payment.update({
                where: {
                    id: order.payment.id,
                },
                data: {
                    provider,
                    amount: order.totalAmount,
                },
                include: paymentInclude,
            });
        } else {
            paymentRecord = await tx.payment.create({
                data: {
                    rentalOrderId: order.id,
                    provider,
                    amount: order.totalAmount,
                    status: PaymentStatus.PENDING,
                },
                include: paymentInclude,
            });
        }

        if (provider === PaymentProvider.STRIPE) {
            let session;

            try {
                session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    mode: "payment",
                    success_url: `${config.app_url}/payment/success?transactionId=${paymentRecord.id}`,
                    cancel_url: `${config.app_url}/payment/cancel`,
                    line_items: [
                        {
                            price_data: {
                                currency: "usd",
                                product_data: {
                                    name: `Rental Order #${order.id}`,
                                },
                                unit_amount: Math.round(order.totalAmount * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    client_reference_id: paymentRecord.id,
                });
            } catch (stripeError) {
                // Stripe session creation failed — throw to rollback the transaction
                throw new Error(
                    `Payment gateway error: ${stripeError instanceof Error ? stripeError.message : "Unknown error"}`
                );
            }

            return {
                ...paymentRecord,
                paymentUrl: session.url,
            };
        }

        return paymentRecord;
    });
};

const confirmPayment = async (payload: IConfirmPaymentPayload) => {
    validatePaymentStatus(payload.status);

    if (!payload.paymentId && !payload.rentalOrderId && !payload.transactionId) {
        throw new Error("paymentId, rentalOrderId, or transactionId is required");
    }

    const payment = await prisma.payment.findFirst({
        where: {
            OR: [
                payload.paymentId ? { id: payload.paymentId } : undefined,
                payload.rentalOrderId ? { rentalOrderId: payload.rentalOrderId } : undefined,
                payload.transactionId ? { transactionId: payload.transactionId } : undefined,
                payload.transactionId ? { id: payload.transactionId } : undefined,
            ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition)),
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    return prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                transactionId: payload.transactionId ?? payment.transactionId,
                status: payload.status,
                paidAt: payload.status === PaymentStatus.COMPLETED ? new Date() : payment.paidAt,
            },
            include: paymentInclude,
        });

        if (payload.status === PaymentStatus.COMPLETED) {
            await tx.rentalOrder.update({
                where: {
                    id: payment.rentalOrderId,
                },
                data: {
                    status: RentalStatus.PAID,
                },
            });
        }

        return updatedPayment;
    });
};

const getPayments = async (authUser: IAuthUser) => {
    const whereConditions =
        authUser.role === Role.ADMIN
            ? {}
            : authUser.role === Role.PROVIDER
                ? {
                    rentalOrder: {
                        items: {
                            some: {
                                gearItem: {
                                    providerId: authUser.id,
                                },
                            },
                        },
                    },
                }
                : {
                    rentalOrder: {
                        customerId: authUser.id,
                    },
                };

    return prisma.payment.findMany({
        where: whereConditions,
        include: paymentInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getPaymentById = async (authUser: IAuthUser, id: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: paymentInclude,
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (authUser.role === Role.ADMIN || payment.rentalOrder.customerId === authUser.id) {
        return payment;
    }

    const hasProviderItem = payment.rentalOrder.items.some((item) => item.gearItem.providerId === authUser.id);

    if (authUser.role === Role.PROVIDER && hasProviderItem) {
        return payment;
    }

    throw new Error("Unauthorized to access this payment");
};

const PaymentService = {
    createPayment,
    confirmPayment,
    getPayments,
    getPaymentById,
};

export default PaymentService;
