import { Router } from "express";
import {
  createProgram,
  deleteProgram,
  getPrograms,
  updateProgram
} from "../controllers/programController.js";

const router = Router();

router.post("/", createProgram);
router.get("/", getPrograms);
router.put("/:id", updateProgram);
router.delete("/:id", deleteProgram);

export default router;
