import { CandiesRepository } from "../repositories/candies.repository.js";
import { CandiesService } from "../services/candies.service.js";
import { CandiesController } from "../controllers/candies.controller.js";

import { Router } from "express";
import { validateCreateCandy } from "../middlewares/validate.create.candy.middleware.js";

const repository = new CandiesRepository();
const service = new CandiesService(repository);
const controller = new CandiesController(service);

const router = new Router();

router.post("/", validateCreateCandy, controller.create);
router.get("/", controller.list);
router.get("/novo", controller.form);
router.get("/:id", controller.details);
router.post("/:id", controller.edit);
router.post("/:id/excluir", controller.delete);

export default router;
