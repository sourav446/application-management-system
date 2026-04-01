import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getPrograms } from "../api/programApi";
import Pagination from "../components/common/Pagination";
import PageHeader from "../components/common/PageHeader";
import SpinnerLoader from "../components/common/SpinnerLoader";
import {
  allocateSeat,
  confirmAdmission,
  getAdmissions,
} from "../api/admissionApi";

const statusClassMap = {
  PENDING: "bg-amber-100 text-amber-700",
  ALLOCATED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
};

function Admission() {
  const [admissions, setAdmissions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgramsLoading, setIsProgramsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeActionId, setActiveActionId] = useState("");
  const [quotaFilter, setQuotaFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programTypeTab, setProgramTypeTab] = useState("UG");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadAdmissions = async () => {
    setIsLoading(true);

    try {
      const data = await getAdmissions({
        quotaType: quotaFilter,
        programId: programFilter,
        admissionStatus: statusFilter,
        programType: programTypeTab,
        page,
        limit: 10,
      });
      setAdmissions(data.items || []);
      setPagination(data.pagination || null);
      setPageError("");
    } catch (error) {
      setPageError(
        error.response?.data?.message || "Failed to fetch admissions",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrograms = async () => {
    setIsProgramsLoading(true);

    try {
      const data = await getPrograms({ status: "all", limit: "all" });
      setPrograms(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch programs");
    } finally {
      setIsProgramsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissions();
  }, [quotaFilter, programFilter, statusFilter, programTypeTab, page]);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [quotaFilter, programFilter, statusFilter, programTypeTab]);

  const visiblePrograms = useMemo(
    () => programs.filter((program) => (program.programType || "UG") === programTypeTab),
    [programTypeTab, programs]
  );

  const handleAllocate = async (applicantId) => {
    setActiveActionId(`allocate-${applicantId}`);

    try {
      await allocateSeat(applicantId);
      toast.success("Seat allocated successfully");
      await loadAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to allocate seat");
    } finally {
      setActiveActionId("");
    }
  };

  const handleConfirm = async (applicantId) => {
    setActiveActionId(`confirm-${applicantId}`);

    try {
      await confirmAdmission(applicantId);
      toast.success("Admission confirmed successfully");
      await loadAdmissions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to confirm admission",
      );
    } finally {
      setActiveActionId("");
    }
  };

  const isQuotaFull = (applicant) =>
    (applicant.programId?.filledSeats?.[applicant.quotaType] ?? 0) >=
    (applicant.programId?.quotas?.[applicant.quotaType] ?? 0);

  const canConfirm = (applicant) =>
    applicant.admissionStatus === "ALLOCATED" &&
    applicant.documentsStatus === "Verified" &&
    applicant.feeStatus === "Paid";

  const admissionsCount = useMemo(
    () => pagination?.totalItems ?? admissions.length,
    [admissions.length, pagination?.totalItems],
  );

  return (
    <>
      <PageHeader
        title="Admissions"
        description="Allocate seats, confirm admissions, and move applications through the final admission workflow."
        chip={`${admissionsCount} ${programTypeTab} Applications`}
      />

      <section className="rounded-xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="m-0 text-lg font-semibold text-slate-900">
              Admission Workflow
            </h3>
            <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1">
              {["UG", "PG"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setProgramTypeTab(tab);
                    setProgramFilter("all");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    programTypeTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={quotaFilter}
              onChange={(event) => setQuotaFilter(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Quotas</option>
              <option value="KCET">KCET</option>
              <option value="COMEDK">COMEDK</option>
              <option value="MANAGEMENT">Management</option>
            </select>

            <select
              value={programFilter}
              onChange={(event) => setProgramFilter(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Programs</option>
              {visiblePrograms.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>
          </div>

          {isLoading || isProgramsLoading ? (
            <SpinnerLoader inline size="sm" label="Loading..." />
          ) : null}
        </div>

        {pageError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {pageError}
          </div>
        ) : null}

        {isLoading ? (
          <SpinnerLoader label="Loading admissions..." />
        ) : admissions.length ? (
          <div className="mt-4">
            <div className="overflow-x-auto max-h-98 hide-scrollbar">
              <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">S.No</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Program</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Quota</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Documents</th>
                    <th className="px-4 py-3 text-left">Fee</th>
                    <th className="px-4 py-3 text-left">Admission No.</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {admissions.map((applicant, index) => {
                    const allocatePending =
                      activeActionId === `allocate-${applicant._id}`;
                    const confirmPending =
                      activeActionId === `confirm-${applicant._id}`;
                    const quotaFull = isQuotaFull(applicant);
                    const serialNumber = (page - 1) * 10 + index + 1;

                    return (
                      <tr
                        key={applicant._id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">{serialNumber}</td>
                        <td title={applicant?.name} className="cursor-default px-4 py-3 font-medium text-slate-900">
                           {applicant.name
                          ? applicant.name.length > 22
                            ? `${applicant.name.slice(0, 22)}...`
                            : applicant.name
                          : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {applicant.programId?.name || "Not assigned"}
                        </td>
                        <td className="px-4 py-3">{applicant.branch || "-"}</td>
                        <td className="px-4 py-3">{applicant.quotaType}</td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              statusClassMap[applicant.admissionStatus] ||
                                "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {applicant.admissionStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {applicant.documentsStatus}
                        </td>
                        <td className="px-4 py-3">{applicant.feeStatus}</td>
                        <td className="px-4 py-3">
                          {applicant.admissionNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            {applicant.admissionStatus === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => handleAllocate(applicant._id)}
                                disabled={quotaFull || allocatePending}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {allocatePending
                                  ? "Allocating..."
                                  : quotaFull
                                    ? "Quota Full"
                                    : "Allocate Seat"}
                              </button>
                            )}

                            {applicant.admissionStatus === "ALLOCATED" && (
                              <button
                                type="button"
                                title="Document status must be Verified and Fee status must be Paid to confirm admission"
                                onClick={() => handleConfirm(applicant._id)}
                                disabled={
                                  !canConfirm(applicant) || confirmPending
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {confirmPending
                                  ? "Confirming..."
                                  : "Confirm Admission"}
                              </button>
                            )}

                            {applicant.admissionStatus === "CONFIRMED" && (
                              <span className="text-xs font-medium text-emerald-700">
                                Admission Confirmed!!
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-center text-sm leading-6 text-slate-600">
            No {programTypeTab} applications yet.
          </div>
        )}
      </section>
    </>
  );
}

export default Admission;
