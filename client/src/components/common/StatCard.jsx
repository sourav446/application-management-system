function StatCard({ title, value, helperText, accentClass = "", onClick }) {
  return (
    <article
      className={[
        "rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur transition",
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]" : "",
        accentClass
      ].join(" ")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-base font-semibold text-slate-800">{title}</h3>
        {/* {onClick ? <span className="text-sm font-semibold text-slate-400">Open</span> : null} */}
      </div>
      <p className="mt-4 text-4xl font-bold text-slate-900">{value}</p>
      {/* <p className="mt-2 text-sm leading-6 text-slate-500">{helperText}</p> */}
    </article>
  );
}

export default StatCard;
