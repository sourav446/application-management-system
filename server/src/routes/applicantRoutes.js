import { Router } from "express";
import {
  checkApplicantAvailability,
  createApplicant,
  getApplicants,
  updateDocumentsStatus,
  updateFeeStatus
} from "../controllers/applicantController.js";

const router = Router();

router.get("/check-availability", checkApplicantAvailability);
router.post("/", createApplicant);
router.get("/", getApplicants);
router.put("/:id/documents", updateDocumentsStatus);
router.put("/:id/fee", updateFeeStatus);

export default router;
