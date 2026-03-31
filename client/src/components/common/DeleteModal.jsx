import { useEffect, useState } from "react";

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  title = "Delete Item",
  description = "Type the exact name to confirm deletion.",
  isPending = false
}) {
  const [confirmationValue, setConfirmationValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmationValue("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isValid = confirmationValue === itemName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">Exact name: {itemName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition"
          >
            X
          </button>
        </div>

        <div className="mt-6">
          <label className="block">
            {/* <span className="mb-2 block text-sm font-medium text-slate-700">
              Type the exact course name to delete
            </span> */}
            <input
              type="text"
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500"
              placeholder={itemName}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(confirmationValue)}
            disabled={!isValid || isPending}
            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
