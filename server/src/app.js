import express from "express";
import cors from "cors";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import applicantRoutes from "./routes/applicantRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Admission Management System API is running" });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/admissions", admissionRoutes);

app.use(errorHandler);

export default app;
