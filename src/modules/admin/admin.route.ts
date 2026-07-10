import { Router } from "express";
import { UserAdminRoute } from "../user/user.route";
import { GearAdminRoute } from "../gear/gear.route";
import { OrderAdminRoute } from "../order/order.route";

const router = Router();

router.use("/users", UserAdminRoute);
router.use("/gear", GearAdminRoute);
router.use("/rentals", OrderAdminRoute);

export const AdminRoute = router;

