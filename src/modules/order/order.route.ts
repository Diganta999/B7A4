import { Router } from "express";
import OrderController from "./order.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/", checkAuth(Role.CUSTOMER), OrderController.create);
router.get("/", checkAuth(Role.CUSTOMER), OrderController.getMine);
router.get("/:id", checkAuth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), OrderController.getById);

export const OrderRoute = router;

