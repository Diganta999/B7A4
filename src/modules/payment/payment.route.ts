import { Router } from "express";
import PaymentController from "./payment.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/create", checkAuth(Role.CUSTOMER), PaymentController.create);
router.post("/confirm", PaymentController.confirm);
router.get("/", checkAuth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), PaymentController.getAll);
router.get("/:id", checkAuth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), PaymentController.getById);

export const PaymentRoute= router;
