import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/skeleton";
import StatCard from "../components/common/StatCard";
import { getDashboardStats } from "../api/dashboardApi";

const defaultStats = {
  activePrograms: 0,
  pendingApplicants: 0,
  allocatedApplicants: 0,
  confirmedApplicants: 0,
  totalPrograms: 0,
  totalApplicants: 0,
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      setIsLoading(true);

      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard stats",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const renderValueSkeleton = (className) => (
    <Skeleton className={className} />
  );

  const statCards = [
    {
      title: "Active Programs",
      value: stats.activePrograms,
      footerText: "Go To Programs",
      accentClass: "bg-gradient-to-br from-cyan-50 to-white",
      onClick: () => navigate("/programs"),
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplicants,
      footerText: "Go To Applications",
      accentClass: "bg-gradient-to-br from-amber-50 to-white",
      onClick: () => navigate("/applicants"),
    },
    {
      title: "Allocated Seats",
      value: stats.allocatedApplicants,
      footerText: "Go To Admissions",
      accentClass: "bg-gradient-to-br from-blue-50 to-white",
      onClick: () => navigate("/admissions"),
    },
    {
      title: "Confirmed Admissions",
      value: stats.confirmedApplicants,
      footerText: "Review Admissions",
      accentClass: "bg-gradient-to-br from-emerald-50 to-white",
      onClick: () => navigate("/admissions"),
    },
  ];

  const dashboardInsights = [
    {
      title: "Programs Live",
      value: isLoading ? "-" : `${stats.activePrograms}/${stats.totalPrograms}`,
      description:
        "Programs currently active and available for the admission cycle.",
    },
    {
      title: "Applications In Queue",
      value: isLoading ? "-" : stats.pendingApplicants,
      description: "Applications waiting for allocation or operational review.",
    },
    {
      title: "Admissions In Progress",
      value: isLoading ? "-" : stats.allocatedApplicants,
      description: "Allocated applications still pending final confirmation.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Track the live admission pipeline, spot bottlenecks quickly, and jump into the right module with one click."
        chip={isLoading ? "Refreshing..." : "Live Workflow"}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
            value={
              isLoading
                ? renderValueSkeleton("h-10 w-20 rounded-xl")
                : stat.value
            }
          />
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.029em] text-cyan-600">
            Live Summary
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            Current pipeline insights from the latest dashboard data.
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {dashboardInsights.map((insight) => (
              <div key={insight.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {insight.title}
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {isLoading
                    ? renderValueSkeleton("h-9 w-24 rounded-lg")
                    : insight.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Quick Insight
          </p>
          <h3 className="mt-3 text-2xl font-semibold">Current flow health</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">
                Applications awaiting action
              </p>
              <p className="mt-2 text-3xl font-bold">
                {isLoading
                  ? renderValueSkeleton("h-9 w-16 rounded-lg bg-white/20")
                  : stats.pendingApplicants}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Ready for final closure</p>
              <p className="mt-2 text-3xl font-bold">
                {isLoading
                  ? renderValueSkeleton("h-9 w-16 rounded-lg bg-white/20")
                  : stats.allocatedApplicants}
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

export default Dashboard;
