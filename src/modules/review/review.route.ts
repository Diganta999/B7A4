import { Router } from "express";
import ReviewController from "./review.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/", checkAuth(Role.CUSTOMER), ReviewController.create);

export const ReviewRoute= router;
