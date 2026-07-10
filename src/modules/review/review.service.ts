import { prisma } from "../../lib/prisma";
import { RentalStatus } from "../../../prisma/generated/prisma/enums";
import { ICreateReviewPayload } from "./review.interface";

const createReview = async (customerId: string, payload: ICreateReviewPayload) => {
    const rating = Number(payload.rating);

    if (!payload.gearItemId) {
        throw new Error("gearItemId is required");
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be an integer between 1 and 5");
    }

    const gear = await prisma.gearItem.findUnique({
        where: {
            id: payload.gearItemId,
        },
    });

    if (!gear) {
        throw new Error("Gear item not found");
    }

    const returnedRental = await prisma.rentalOrder.findFirst({
        where: {
            customerId,
            status: RentalStatus.RETURNED,
            items: {
                some: {
                    gearItemId: payload.gearItemId,
                },
            },
        },
    });

    if (!returnedRental) {
        throw new Error("You can review this gear only after returning a rental order");
    }

    const existingReview = await prisma.review.findUnique({
        where: {
            customerId_gearItemId: {
                customerId,
                gearItemId: payload.gearItemId,
            },
        },
    });

    if (existingReview) {
        throw new Error("You have already reviewed this gear item");
    }

    return prisma.review.create({
        data: {
            customerId,
            gearItemId: payload.gearItemId,
            rating,
            comment: payload.comment,
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                },
            },
            gearItem: true,
        },
    });
};

const ReviewService = {
    createReview,
};

export default ReviewService;
