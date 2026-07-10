import { Router } from "express";
import GearController from "./gear.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const publicRouter = Router();
publicRouter.get("/", GearController.getAll);
publicRouter.get("/:id", GearController.getById);

const providerRouter = Router();
providerRouter.post("/", checkAuth(Role.PROVIDER), GearController.add);
providerRouter.put("/:id", checkAuth(Role.PROVIDER), GearController.update);
providerRouter.delete("/:id", checkAuth(Role.PROVIDER), GearController.remove);

export const GearRoute = publicRouter;
export const ProviderGearRoute = providerRouter;
