import { Router } from "express";
import GearController from "./gear.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();
router.get("/", GearController.getAll);
router.get("/:id", GearController.getById);


router.post("/", checkAuth(Role.PROVIDER, Role.ADMIN), GearController.add);
router.put("/:id", checkAuth(Role.PROVIDER, Role.ADMIN), GearController.update);
router.delete("/:id", checkAuth(Role.PROVIDER, Role.ADMIN), GearController.remove);

export const GearRoute = router;
