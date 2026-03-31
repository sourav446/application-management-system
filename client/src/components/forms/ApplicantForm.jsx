import { useEffect, useState } from "react";
import * as yup from "yup";
import { checkApplicantAvailability } from "../../api/applicantApi";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  category: "GM",
  entryType: "Regular",
  quotaType: "KCET",
  programId: "",
  marks: ""
};

const categoryOptions = ["GM", "SC", "ST", "OBC", "EWS", "OTHER"];
const entryTypeOptions = ["Regular", "Lateral"];
const quotaTypeOptions = ["KCET", "COMEDK", "MANAGEMENT"];

const applicantSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Enter a valid email").nullable(),
  phone: yup.string().trim().required("Phone number is required"),
  category: yup.string().required("Category is required"),
  entryType: yup.string().oneOf(entryTypeOptions).required("Entry type is required"),
  quotaType: yup.string().oneOf(quotaTypeOptions).required("Quota type is required"),
  programId: yup.string().required("Please select a program"),
  marks: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? NaN : value))
    .typeError("Marks must be a valid number")
    .min(0, "Marks cannot be negative")
    .required("Marks are required")
});

function ApplicantForm({
  isOpen,
  onClose,
  onSubmit,
  programs = [],
  isSubmitting = false,
  submitErrors = {}
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});
    setAvailabilityErrors({});
    setFormData((current) => ({
      ...initialFormState,
      programId: programs[0]?._id || ""
    }));
  }, [isOpen, programs]);

  useEffect(() => {
    if (Object.keys(submitErrors).length) {
      setErrors((current) => ({
        ...current,
        ...submitErrors
      }));
    }
  }, [submitErrors]);

  useEffect(() => {
    if (!isOpen || !formData.programId) {
      return;
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setAvailabilityErrors({});
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await checkApplicantAvailability({
          programId: formData.programId,
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase()
        });

        setAvailabilityErrors(data.errors || {});
      } catch {
        setAvailabilityErrors({});
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [formData.email, formData.phone, formData.programId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
    setErrors((current) => ({
      ...current,
      [name]: ""
    }));
    setAvailabilityErrors((current) => ({
      ...current,
      [name]: ""
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      marks: Number(formData.marks)
    };

    try {
      await applicantSchema.validate(payload, { abortEarly: false });
      setErrors({});
    } catch (validationError) {
      const nextErrors = {};
      validationError.inner.forEach((item) => {
        if (item.path && !nextErrors[item.path]) {
          nextErrors[item.path] = item.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    if (Object.values(availabilityErrors).some(Boolean)) {
      setErrors((current) => ({
        ...current,
        ...availabilityErrors
      }));
      return;
    }

    onSubmit(payload);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Create Application</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add a new application and keep the admission workflow statuses in sync from the start.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition"
          >
            X
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="Enter application name"
              />
              {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="Enter email address"
              />
              {errors.email || availabilityErrors.email ? (
                <p className="mt-1 text-xs text-red-500">{errors.email || availabilityErrors.email}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone || availabilityErrors.phone ? (
                <p className="mt-1 text-xs text-red-500">{errors.phone || availabilityErrors.phone}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.category ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.category ? <p className="mt-1 text-xs text-red-500">{errors.category}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Entry Type</span>
              <select
                name="entryType"
                value={formData.entryType}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.entryType ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
              >
                {entryTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.entryType ? <p className="mt-1 text-xs text-red-500">{errors.entryType}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Quota Type</span>
              <select
                name="quotaType"
                value={formData.quotaType}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.quotaType ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
              >
                {quotaTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.quotaType ? <p className="mt-1 text-xs text-red-500">{errors.quotaType}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Program</span>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.programId ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
              >
                <option value="">Select a program</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {errors.programId ? <p className="mt-1 text-xs text-red-500">{errors.programId}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Marks</span>
              <input
                type="number"
                min="0"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.marks ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="Enter marks"
              />
              {errors.marks ? <p className="mt-1 text-xs text-red-500">{errors.marks}</p> : null}
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-linear-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicantForm;
