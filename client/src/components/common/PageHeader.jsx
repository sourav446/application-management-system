function PageHeader({ title, description, chip, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="m-0 text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {chip ? (
          <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm">
            {chip}
          </div>
        ) : null}
        {actions ? actions : null}
      </div>
    </div>
  );
}

export default PageHeader;
