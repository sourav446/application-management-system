import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Pagination from "../components/common/Pagination";
import PageHeader from "../components/common/PageHeader";
import SpinnerLoader from "../components/common/SpinnerLoader";
import ApplicantForm from "../components/forms/ApplicantForm";
import {
  createApplicant,
  getApplicants,
  updateDocumentsStatus,
  updateFeeStatus,
} from "../api/applicantApi";

function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [isApplicantsLoading, setIsApplicantsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formSubmitErrors, setFormSubmitErrors] = useState({});
  const [degreeType, setDegreeType] = useState("all");
  const [quotaFilter, setQuotaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadApplicants = async () => {
    setIsApplicantsLoading(true);

    try {
      const data = await getApplicants({
        degreeType,
        quotaType: quotaFilter,
        admissionStatus: statusFilter,
        page,
        limit: 10,
      });
      setApplicants(data.items || []);
      setPagination(data.pagination || null);
      setPageError("");
    } catch (error) {
      setPageError(
        error.response?.data?.message || "Failed to fetch applications",
      );
    } finally {
      setIsApplicantsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [degreeType, quotaFilter, statusFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [degreeType, quotaFilter, statusFilter]);

  const handleCreateApplicant = async (payload) => {
    setIsSubmitting(true);
    setFormSubmitErrors({});

    try {
      await createApplicant(payload);
      toast.success("Application created successfully");
      setIsCreateModalOpen(false);
      await loadApplicants();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create application";
      const fieldErrors = error.response?.data?.errors;

      if (fieldErrors && Object.keys(fieldErrors).length) {
        setFormSubmitErrors(fieldErrors);
      } else if (message === "No application available right now") {
        setFormSubmitErrors({ quotaType: message });
      } else if (message === "Program not found") {
        setFormSubmitErrors({ programId: message });
      } else if (message === "Selected branch is invalid for this program") {
        setFormSubmitErrors({ branch: message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentsStatusChange = async (id, documentsStatus) => {
    try {
      await updateDocumentsStatus({ id, documentsStatus });
      toast.success("Documents status updated");
      await loadApplicants();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update documents status",
      );
    }
  };

  const handleFeeStatusChange = async (id, feeStatus) => {
    try {
      await updateFeeStatus({ id, feeStatus });
      toast.success("Fee status updated");
      await loadApplicants();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update fee status",
      );
    }
  };

  const applicantsCount = useMemo(
    () => pagination?.totalItems ?? applicants.length,
    [applicants.length, pagination?.totalItems],
  );

  const getStatusStyles = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-slate-100 text-slate-700";

      case "ALLOCATED":
        return "bg-orange-100 text-orange-700";

      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <>
      <PageHeader
        title="Applications"
        description="Manage applications, keep document and fee states updated, and prepare records for admission allocation."
        chip={`${pagination?.totalItems ?? applicants.length} Applications`}
      />

      <section className="rounded-xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="m-0 text-lg font-semibold text-slate-900">
              Applications
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={degreeType}
              onChange={(event) => setDegreeType(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Degrees</option>
              <option value="ug">UG</option>
              <option value="pg">PG</option>
            </select>

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
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setFormSubmitErrors({});
                setIsCreateModalOpen(true);
              }}
              className="cursor-pointer rounded-md bg-linear-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Create Application
            </button>
          </div>
          {isApplicantsLoading ? (
            <SpinnerLoader inline size="sm" label="Loading data..." />
          ) : null}
        </div>

        {pageError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {pageError}
          </div>
        ) : null}

        {isApplicantsLoading ? (
          <SpinnerLoader label="Loading applications..." />
        ) : applicants.length ? (
          <div className="mt-4">
            <div className="overflow-x-auto max-h-98 hide-scrollbar">
              <table className="min-w-full h-fit overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">S.No</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Program</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Quota</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Documents</th>
                    <th className="px-4 py-3 text-left">Fee</th>
                  </tr>
                </thead>

                <tbody className="bg-white ">
                  {applicants.map((applicant, index) => (
                    <tr
                      key={applicant._id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-600">
                        {(page - 1) * 10 + index + 1}
                      </td>

                      <td
                        title={applicant?.name}
                        className="cursor-default px-4 py-3 font-medium text-slate-900"
                      >
                        {applicant.name.length > 20
                          ? applicant.name.slice(0, 20) + "..."
                          : applicant.name}
                      </td>
                      <td className="px-4 py-3 ">
                        {applicant.phone} <br />
                        {applicant.email
                          ? applicant.email.length > 18
                            ? `${applicant.email.slice(0, 18)}...`
                            : applicant.email
                          : "-"}
                      </td>

                      <td className="px-4 py-3">
                        {applicant.programId?.name || "Not assigned"}
                        <br />
                        <span className="text-xs text-slate-500">{applicant.programId?.programType || "UG"}</span>
                      </td>

                      <td className="px-4 py-3">{applicant.branch || "-"}</td>

                      <td className="px-4 py-3">{applicant.quotaType}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                            applicant.admissionStatus,
                          )}`}
                        >
                          {applicant.admissionStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={applicant.documentsStatus}
                          disabled={applicant.admissionStatus === "CONFIRMED"}
                          onChange={(e) =>
                            handleDocumentsStatusChange(
                              applicant._id,
                              e.target.value,
                            )
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={applicant.feeStatus}
                          disabled={applicant.admissionStatus === "CONFIRMED"}
                          onChange={(e) =>
                            handleFeeStatusChange(applicant._id, e.target.value)
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-center text-sm leading-6 text-slate-600">
            No applications found for the selected filters.
          </div>
        )}
      </section>

      <ApplicantForm
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormSubmitErrors({});
        }}
        onSubmit={handleCreateApplicant}
        isSubmitting={isSubmitting}
        submitErrors={formSubmitErrors}
      />
    </>
  );
}

export default Applicants;
