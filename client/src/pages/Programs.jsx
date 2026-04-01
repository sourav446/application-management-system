import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Pagination from "../components/common/Pagination";
import PageHeader from "../components/common/PageHeader";
import DeleteModal from "../components/common/DeleteModal";
import SpinnerLoader from "../components/common/SpinnerLoader";
import CreateProgramModal from "../components/forms/CreateProgramModal";
import { deleteProgram, getPrograms, updateProgram } from "../api/programApi";

function Programs() {
  const queryClient = useQueryClient();
  const menuRef = useRef(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [programModalMode, setProgramModalMode] = useState("create");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [status, setStatus] = useState("all");
  const [degreeType, setDegreeType] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["getPrograms", status, degreeType, page],
    queryFn: () => getPrograms({ status, degreeType, page, limit: 10 }),
  });
  const programs = data?.items || [];
  const pagination = data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [status, degreeType]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const deleteProgramMutation = useMutation({
    mutationFn: ({ id, nameConfirmation }) =>
      deleteProgram({ id, nameConfirmation }),
    onSuccess: () => {
      toast.success("Program deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
      setIsDeleteModalOpen(false);
      setSelectedProgram(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete program");
    },
  });

  const toggleProgramStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }) =>
      updateProgram({
        id,
        payload: {
          status: nextStatus,
        },
      }),
    onSuccess: () => {
      toast.success("Program status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update program status",
      );
    },
  });

  const handleCreateClick = () => {
    setProgramModalMode("create");
    setSelectedProgram(null);
    setIsProgramModalOpen(true);
  };

  const handleEdit = (program) => {
    setProgramModalMode("edit");
    setSelectedProgram(program);
    setIsProgramModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (program) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = (nameConfirmation) => {
    if (!selectedProgram) {
      return;
    }

    deleteProgramMutation.mutate({
      id: selectedProgram._id,
      nameConfirmation,
    });
  };

  return (
    <>
      <PageHeader
        title="Programs"
        description="Monitor intake, quota distribution, program type, and live seat availability."
        chip={`${pagination?.totalItems ?? programs.length} Programs`}
      />

      <section className="rounded-xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold text-slate-900">
            Program Capacity Overview
          </h3>
          <div className="flex items-center gap-5">
            <select
              value={degreeType}
              onChange={(event) => setDegreeType(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-4 py-1 text-sm text-slate-900 outline-none"
            >
              <option value="all">All Degrees</option>
              <option value="ug">UG</option>
              <option value="pg">PG</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-4 py-1 text-sm text-slate-900 outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div>
              <button
                type="button"
                onClick={handleCreateClick}
                className="cursor-pointer rounded-md bg-linear-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Create Program
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SpinnerLoader label="Loading programs..." />
        ) : programs.length ? (
          <div className="mt-4">
            <div className="max-h-98 overflow-x-auto hide-scrollbar">
              <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">S/No</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Branch / Specialization</th>
                    <th className="px-4 py-3 text-left">Intake</th>
                    <th className="px-4 py-3 text-left">KCET</th>
                    <th className="px-4 py-3 text-left">COMEDK</th>
                    <th className="px-4 py-3 text-left">Management</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {programs.map((program, index) => (
                    <tr
                      key={program._id}
                      className="border-t border-t-gray-300 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {(page - 1) * 10 + index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {program.name}
                      </td>
                      <td className="px-4 py-3">{program.programType || "UG"}</td>
                      <td className="px-4 py-3">{(program.branch || []).join(", ") || "-"}</td>
                      <td className="px-4 py-3">{program.intake}</td>
                      <td className="px-4 py-3">
                        {program.applicationCounts?.KCET ?? 0}/{program.quotas.KCET}
                      </td>
                      <td className="px-4 py-3">
                        {program.applicationCounts?.COMEDK ?? 0}/{program.quotas.COMEDK}
                      </td>
                      <td className="px-4 py-3">
                        {program.applicationCounts?.MANAGEMENT ?? 0}/{program.quotas.MANAGEMENT}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleProgramStatusMutation.mutate({
                              id: program._id,
                              nextStatus:
                                program.status === "active"
                                  ? "inactive"
                                  : "active",
                            })
                          }
                          disabled={toggleProgramStatusMutation.isPending}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            program.status === "active"
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          } ${
                            toggleProgramStatusMutation.isPending
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              program.status === "active"
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="relative px-4 py-3">
                        <div
                          className="inline-block"
                          ref={activeMenuId === program._id ? menuRef : null}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId((current) =>
                                current === program._id ? null : program._id,
                              )
                            }
                            className="rounded-lg px-2 py-1 hover:bg-slate-200"
                          >
                            ...
                          </button>

                          {activeMenuId === program._id ? (
                            <div className="absolute right-0 z-10 mt-2 w-32 rounded-lg border bg-white py-1 shadow-md">
                              <button
                                type="button"
                                onClick={() => handleEdit(program)}
                                className="block w-full px-3 py-2 text-left hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(program)}
                                className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
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
            No programs found for the selected filters.
          </div>
        )}
      </section>

      <CreateProgramModal
        isOpen={isProgramModalOpen}
        onClose={() => {
          setIsProgramModalOpen(false);
          setSelectedProgram(null);
        }}
        mode={programModalMode}
        selectedProgram={selectedProgram}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleteProgramMutation.isPending) {
            setIsDeleteModalOpen(false);
            setSelectedProgram(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedProgram?.name || ""}
        title="Delete Program"
        description="This action is permanent. Type the exact course name below to enable deletion."
        isPending={deleteProgramMutation.isPending}
      />
    </>
  );
}

export default Programs;
