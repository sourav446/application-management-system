import { useMemo, useState } from "react";

const tourSteps = [
  {
    title: "Step 1: Create Programs",
    description:
      "Start by creating programs with intake and quota distribution. Programs define the seat capacity used by the rest of the admission workflow.",
  },
  {
    title: "Step 2: Create Applications",
    description:
      "Add applications with their quota, program, marks, and basic details. New records begin with pending document, fee, and admission statuses.",
  },
  {
    title: "Step 3: Complete Admissions",
    description:
      "Allocate a seat first, then verify documents, mark the fee as paid, and confirm admission to generate the final admission number.",
  },
];

function InitialTourModal({ isOpen, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = useMemo(() => tourSteps[stepIndex], [stepIndex]);
  const isLastStep = stepIndex === tourSteps.length - 1;

  if (!isOpen) {
    return null;
  }

  const handleSkip = () => {
    setStepIndex(0);
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSkip();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-600">
              Quick Guide to Admission Workflow!
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {currentStep.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {currentStep.description}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            X
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {tourSteps.map((step, index) => (
            <span
              key={step.title}
              className={[
                "h-2.5 rounded-full transition",
                index === stepIndex ? "w-8 bg-cyan-600" : "w-2.5 bg-slate-300",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Follow this order to avoid confusion:
          <div className="mt-2 font-medium text-slate-900">
            Programs {`-> `}Applications {`-> `}Admissions
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-xl bg-slate-200 px-8 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 cursor-pointer"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 px-8 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
          >
            {isLastStep ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InitialTourModal;
