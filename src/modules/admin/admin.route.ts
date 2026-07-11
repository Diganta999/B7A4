import { Router } from "express";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";
import UserController from "../user/user.controller";
import GearController from "../gear/gear.controller";
import OrderController from "../order/order.controller";

const router = Router();

// Users
router.get("/users", checkAuth(Role.ADMIN), UserController.getAll);
router.patch("/users/:id", checkAuth(Role.ADMIN), UserController.updateStatus);

// Gear
router.get("/gear", checkAuth(Role.ADMIN), GearController.getAll);

// Rental Orders
router.get("/rentals", checkAuth(Role.ADMIN), OrderController.getAll);

export const AdminRoute = router;
