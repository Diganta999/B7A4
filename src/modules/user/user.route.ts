import { Router } from "express";
import UserController from "./user.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/", checkAuth(Role.ADMIN), UserController.getAll);
router.patch("/:id", checkAuth(Role.ADMIN), UserController.updateUser);
router.patch("/:id/status", checkAuth(Role.ADMIN), UserController.updateStatus);
router.patch("/:id/role", checkAuth(Role.ADMIN), UserController.updateRole);

export const UserRoute = router;

