function SpinnerLoader({
  label = "Loading...",
  inline = false,
  className = "",
  size = "md",
}) {
  const sizeClassMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
  };

  const spinnerSizeClass = sizeClassMap[size] || sizeClassMap.md;
  const containerClassName = inline
    ? "inline-flex items-center gap-2 text-sm text-slate-500"
    : "mt-4 flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-sm text-slate-500";

  return (
    <div className={`${containerClassName} ${className}`.trim()} role="status" aria-live="polite">
      <span
        className={`${spinnerSizeClass} animate-spin rounded-full border-slate-300 border-t-blue-600`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

export default SpinnerLoader;
