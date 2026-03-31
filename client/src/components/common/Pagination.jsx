const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(pagination.currentPage, pagination.totalPages);

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-500">
        {pagination.currentPage}/{pagination.totalPages} pages
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={[
                "rounded-lg px-3 py-2 text-sm transition",
                page === pagination.currentPage
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-100"
              ].join(" ")}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
