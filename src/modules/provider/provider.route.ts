import { Router } from "express";
import GearController from "../gear/gear.controller";
import OrderController from "../order/order.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/gear", checkAuth(Role.PROVIDER), GearController.add);
router.put("/gear/:id", checkAuth(Role.PROVIDER), GearController.update);
router.patch("/gear/:id", checkAuth(Role.PROVIDER), GearController.update);
router.delete("/gear/:id", checkAuth(Role.PROVIDER), GearController.remove);

router.get("/orders", checkAuth(Role.PROVIDER), OrderController.getProviderOrders);
router.patch("/orders/:id", checkAuth(Role.PROVIDER), OrderController.updateProviderStatus);

export const ProviderRoute = router;
 