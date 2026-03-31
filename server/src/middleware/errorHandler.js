const errorHandler = (error, _req, res, _next) => {
  const knownStatusCodes = {
    "Quota Full": 400,
    "Invalid quota type": 400,
    "Application not found": 404,
    "Program not found": 404,
    "Admission not found": 404,
    "Applicant is not mapped to the selected program": 400,
    "Applicant quota type does not match the selected quota": 400,
    "Fee payment is required before confirmation": 400,
    "Already processed": 400,
    "Seat not allocated": 400,
    "Documents not verified": 400,
    "Fee not paid": 400,
    "No application available right now": 400,
    "Applications already started. Cannot inactive the program": 400
  };

  const statusCode = knownStatusCodes[error.message] || (error.name === "ValidationError" ? 400 : 500);

  res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
};

export default errorHandler;

