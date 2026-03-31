import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/programs", label: "Programs" },
  { to: "/applicants", label: "Applications" },
  { to: "/admissions", label: "Admissions" },
];

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef4ff_45%,#f8fafc_100%)] text-slate-800 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-7 bg-slate-950/95 px-5 py-7 text-slate-50">
        <div>
          <h1 className="m-0 text-2xl font-semibold">
            Admission Management System
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Manage programs, applications, and admission workflows from one
            workspace.
          </p>
        </div>

        <nav className="flex flex-col gap-2.5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-500/20 text-white"
                    : "text-slate-300 hover:bg-blue-500/15 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

export default AppShell;
