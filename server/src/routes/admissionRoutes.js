import { Router } from "express";
import {
  allocateAdmissionSeat,
  getAdmissions,
  confirmApplicantAdmission
} from "../controllers/admissionController.js";

const router = Router();

router.get("/", getAdmissions);
router.post("/allocate/:applicantId", allocateAdmissionSeat);
router.post("/confirm/:applicantId", confirmApplicantAdmission);

export default router;
