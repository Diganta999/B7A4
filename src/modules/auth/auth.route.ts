import { Router } from "express";
import AuthController from "./auth.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", checkAuth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), AuthController.getMe);
router.post("/logout", AuthController.logout);

export const AuthRoute = router;