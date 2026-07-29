import { useState } from "react";
import { IssueDeskScreen } from "./components/IssueDeskScreen";
import { CommitteeDashboard } from "./components/CommitteeDashboard";
import type { Issue } from "./types";

{/* MARKER-MAKE-KIT-INVOKED */}

type Tab = "resident" | "committee";

const initialIssues: Issue[] = [
  { id: 1, summary: "Lift not functioning", category: "Lift", urgency: "High", affectedResidents: 3, status: "Open", reportedAt: Date.now() - 5000 },
  { id: 2, summary: "Lift door not closing properly — safety risk", category: "Lift", urgency: "High", affectedResidents: 1, status: "Open", reportedAt: Date.now() - 4000 },
  { id: 3, summary: "Water leakage near parking area", category: "Plumbing", urgency: "Medium", affectedResidents: 2, status: "In Progress", reportedAt: Date.now() - 3000 },
  { id: 4, summary: "Common area light flickering", category: "Electrical", urgency: "Low", affectedResidents: 1, status: "Open", reportedAt: Date.now() - 2000 },
  { id: 5, summary: "Security guard not present at gate after 10pm", category: "Security", urgency: "Medium", affectedResidents: 1, status: "Resolved", reportedAt: Date.now() - 1000 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("resident");
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [nextId, setNextId] = useState(initialIssues.length + 1);

  function addIssue(summary: string, flatNumber?: string) {
    const newIssue: Issue = {
      id: nextId,
      summary,
      category: "Other",
      urgency: "Medium",
      affectedResidents: 1,
      status: "Open",
      flatNumber,
      reportedAt: Date.now(),
    };
    setIssues((prev) => [...prev, newIssue]);
    setNextId((n) => n + 1);
  }

  function updateIssue(id: number, changes: Partial<Issue>) {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, ...changes } : issue))
    );
  }

  const activeCount = issues.filter((i) => i.status !== "Resolved").length;

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-primary-foreground tracking-widest text-xs font-semibold uppercase"
            >
              Society OS
            </span>
            <span className="h-4 w-px bg-primary-foreground/20" />
            <span className="text-primary-foreground/50 text-xs">
              Resident Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-primary-foreground/60 text-xs">{activeCount} active issues</span>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <div className="bg-primary border-b border-primary-foreground/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 flex gap-0">
          {(["resident", "committee"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3.5 text-sm transition-colors ${
                activeTab === tab
                  ? "text-primary-foreground"
                  : "text-primary-foreground/40 hover:text-primary-foreground/70"
              }`}
            >
              {tab === "resident" ? "Resident View" : "Committee View"}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1">
        {activeTab === "resident" ? (
          <IssueDeskScreen onSubmit={addIssue} />
        ) : (
          <CommitteeDashboard issues={issues} onUpdate={updateIssue} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            © 2026 Society OS. All rights reserved.
          </span>
          <span className="text-muted-foreground text-xs">
          Transforming WhatsApp Complaints into Trackable Maintenance Cases
          </span>
        </div>
      </footer>

    </div>
  );
}
