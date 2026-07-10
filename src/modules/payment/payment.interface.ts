import { PaymentProvider, PaymentStatus } from "../../../prisma/generated/prisma/enums";

export interface ICreatePaymentPayload {
    rentalOrderId: string;
    method?: PaymentProvider;
    provider?: PaymentProvider;
}

export interface IConfirmPaymentPayload {
    paymentId?: string;
    rentalOrderId?: string;
    transactionId?: string;
    status: PaymentStatus;
}
