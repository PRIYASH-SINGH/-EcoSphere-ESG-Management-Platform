import { Bell, MessageSquare, Search } from "lucide-react";
import { ReactNode } from "react";
import { navigation } from "../services/dashboardData";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="EcoSphere home">
          <span className="brand-mark" aria-hidden="true">
            <LeafLogo />
          </span>
          <span>
            <strong>EcoSphere</strong>
            <small>Operations</small>
          </span>
        </a>

        <nav className="nav-list">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <a className={`nav-item ${index === 0 ? "active" : ""}`} href="#" key={item.label}>
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div>
            <strong>Grid sync live</strong>
            <p>18 monitored facilities</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sustainability command center</p>
            <h1>EcoSphere Dashboard</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button className="primary-button" type="button">
              <MessageSquare size={18} />
              Report
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function LeafLogo() {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="EcoSphere logo">
      <path d="M16 3c7.2 0 13 5.8 13 13s-5.8 13-13 13S3 23.2 3 16 8.8 3 16 3Z" />
      <path d="M21.8 9.8c-5.9.3-10.3 3.3-11.8 8.8 3.3-.3 6.6-2.1 8.2-5.2-1.1 3.8-3.5 6.1-7.1 7.2 6.2 1.4 10.8-3.6 10.7-10.8Z" />
    </svg>
  );
}