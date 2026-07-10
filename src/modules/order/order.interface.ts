import { RentalStatus } from "../../../prisma/generated/prisma/enums";

export interface IRentalOrderItemInput {
    gearItemId: string;
    quantity: number;
}

export interface ICreateRentalOrderPayload {
    startDate: string | Date;
    endDate: string | Date;
    items: IRentalOrderItemInput[];
}

export interface IOrderQuery {
    status?: RentalStatus;
}

export interface IUpdateRentalOrderStatusPayload {
    status: RentalStatus;
}
