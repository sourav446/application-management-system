import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";
import { createProgram, updateProgram } from "../../api/programApi";

const emptyFormState = {
  name: "",
  intake: "",
  quotas: {
    KCET: "",
    COMEDK: "",
    MANAGEMENT: ""
  }
};

const mapProgramToFormState = (program) => {
  if (!program) {
    return emptyFormState;
  }

  return {
    name: program.name || "",
    intake: String(program.intake ?? ""),
    quotas: {
      KCET: String(program.quotas?.KCET ?? ""),
      COMEDK: String(program.quotas?.COMEDK ?? ""),
      MANAGEMENT: String(program.quotas?.MANAGEMENT ?? "")
    }
  };
};

const programSchema = yup.object({
  name: yup.string().trim().required("Program name is required"),
  intake: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? NaN : value))
    .typeError("Intake must be a valid number")
    .min(1, "Intake must be greater than 0")
    .required("Intake is required"),
  quotas: yup.object({
    KCET: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? NaN : value))
      .typeError("KCET quota must be a valid number")
      .min(0, "KCET quota cannot be negative")
      .required("KCET quota is required"),
    COMEDK: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? NaN : value))
      .typeError("COMEDK quota must be a valid number")
      .min(0, "COMEDK quota cannot be negative")
      .required("COMEDK quota is required"),
    MANAGEMENT: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? NaN : value))
      .typeError("Management quota must be a valid number")
      .min(0, "Management quota cannot be negative")
      .required("Management quota is required")
  })
});

function CreateProgramModal({ isOpen, onClose, mode = "create", selectedProgram = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(emptyFormState);
  const [errors, setErrors] = useState({});

  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});
    setFormData(mapProgramToFormState(selectedProgram));
  }, [isOpen, selectedProgram]);

  const programMutation = useMutation(
    useMemo(
      () => ({
        mutationFn: (payload) =>
          isEditMode
            ? updateProgram({ id: selectedProgram._id, payload })
            : createProgram(payload),
        onSuccess: () => {
          toast.success(isEditMode ? "Program updated successfully" : "Program created successfully");
          queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
          setFormData(emptyFormState);
          onClose();
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message ||
              (isEditMode ? "Failed to update program" : "Failed to create program")
          );
        }
      }),
      [isEditMode, onClose, queryClient, selectedProgram]
    )
  );

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
    setErrors((current) => ({
      ...current,
      [name]: ""
    }));
  };

  const handleQuotaChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      quotas: {
        ...current.quotas,
        [name]: value
      }
    }));
    setErrors((current) => ({
      ...current,
      [`quotas.${name}`]: ""
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      intake: Number(formData.intake),
      quotas: {
      KCET: Number(formData.quotas.KCET),
      COMEDK: Number(formData.quotas.COMEDK),
      MANAGEMENT: Number(formData.quotas.MANAGEMENT)
      }
    };

    try {
      await programSchema.validate(payload, { abortEarly: false });
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

    const totalQuotas =
      payload.quotas.KCET + payload.quotas.COMEDK + payload.quotas.MANAGEMENT;

    if (totalQuotas > payload.intake) {
      setErrors({
        intake: "Total quota seats cannot be greater than intake"
      });
      toast.error("Total quota seats cannot be greater than intake");
      return;
    }

    if (!isEditMode) {
      payload.filledSeats = {
        KCET: 0,
        COMEDK: 0,
        MANAGEMENT: 0
      };
    }

    programMutation.mutate(payload);
  };

  const handleClose = () => {
    if (programMutation.isPending) {
      return;
    }

    setErrors({});
    setFormData(emptyFormState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">
              {isEditMode ? "Edit Program" : "Create Program"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isEditMode
                ? "Update the selected course details from the same modal."
                : "Add a new academic program with intake and quota allocation details."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition"
          >
            X
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Program Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFieldChange}
                placeholder="Computer Science and Engineering"
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Total Intake</span>
              <input
                type="number"
                min="1"
                name="intake"
                value={formData.intake}
                onChange={handleFieldChange}
                placeholder="120"
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  errors.intake ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
              />
              {errors.intake ? <p className="mt-1 text-xs text-red-500">{errors.intake}</p> : null}
            </label>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500">Quota Distribution</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {["KCET", "COMEDK", "MANAGEMENT"].map((quotaName) => (
                <label className="block" key={quotaName}>
                  <span className="mb-2 block text-sm font-medium text-slate-700">{quotaName}</span>
                  <input
                    type="number"
                    min="0"
                    name={quotaName}
                    value={formData.quotas[quotaName]}
                    onChange={handleQuotaChange}
                    placeholder="0"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                      errors[`quotas.${quotaName}`]
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errors[`quotas.${quotaName}`] ? (
                    <p className="mt-1 text-xs text-red-500">{errors[`quotas.${quotaName}`]}</p>
                  ) : null}
                </label>
              ))}
            </div>
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
              disabled={programMutation.isPending}
              className="rounded-md bg-linear-to-r from-blue-600 to-cyan-600 px-9 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {programMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update "
                  : "Create "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProgramModal;
