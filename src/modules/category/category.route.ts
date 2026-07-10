import { Router } from "express";
import CategoryController from "./category.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();
router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);


router.post("/", checkAuth(Role.ADMIN), CategoryController.add);
router.put("/:id", checkAuth(Role.ADMIN), CategoryController.update);
router.patch("/:id", checkAuth(Role.ADMIN), CategoryController.update);
router.delete("/:id", checkAuth(Role.ADMIN), CategoryController.remove);

export const CategoryRoute = router;
