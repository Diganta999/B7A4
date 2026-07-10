import { Router } from "express";
import OrderItemController from "./orderItem.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/", checkAuth(Role.ADMIN), OrderItemController.getAll);
router.get("/:id", checkAuth(Role.ADMIN, Role.PROVIDER, Role.CUSTOMER), OrderItemController.getById);

export const OrderItemRoute = router;
