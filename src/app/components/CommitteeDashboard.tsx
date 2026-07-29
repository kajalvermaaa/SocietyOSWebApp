import { useState } from "react";
import type { Issue, Urgency, Status, Category } from "../types";

interface Props {
  issues: Issue[];
  onUpdate: (id: number, changes: Partial<Issue>) => void;
}

const STATUS_CYCLE: Status[] = ["Open", "In Progress", "Resolved"];
const URGENCY_ORDER: Record<Urgency, number> = { High: 0, Medium: 1, Low: 2 };

const CATEGORIES: Category[] = ["Lift", "Plumbing", "Electrical", "Security", "Other"];
const URGENCIES: Urgency[] = ["High", "Medium", "Low"];

function urgencyDot(urgency: Urgency) {
  if (urgency === "High") return "bg-red-500";
  if (urgency === "Medium") return "bg-amber-400";
  return "bg-green-500";
}

function urgencyText(urgency: Urgency) {
  if (urgency === "High") return "text-red-700 bg-red-50 border border-red-200";
  if (urgency === "Medium") return "text-amber-700 bg-amber-50 border border-amber-200";
  return "text-green-700 bg-green-50 border border-green-200";
}

function categoryText(category: Category) {
  const map: Record<Category, string> = {
    Lift: "text-blue-700 bg-blue-50 border border-blue-200",
    Plumbing: "text-cyan-700 bg-cyan-50 border border-cyan-200",
    Electrical: "text-yellow-700 bg-yellow-50 border border-yellow-200",
    Security: "text-purple-700 bg-purple-50 border border-purple-200",
    Other: "text-gray-600 bg-gray-50 border border-gray-200",
  };
  return map[category];
}

function statusStyle(status: Status) {
  if (status === "Open") return "text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200";
  if (status === "In Progress") return "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100";
  return "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100";
}

function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const aResident = a.id > 5;
    const bResident = b.id > 5;
    // Resident-submitted issues float to the top, newest first
    if (aResident && !bResident) return -1;
    if (!aResident && bResident) return 1;
    if (aResident && bResident) return b.reportedAt - a.reportedAt;
    // Seed issues: highest urgency first, then oldest first
    const urgDiff = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
    if (urgDiff !== 0) return urgDiff;
    return a.reportedAt - b.reportedAt;
  });
}

export function CommitteeDashboard({ issues, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Issue>>({});
  const [filter, setFilter] = useState<Status | "All">("All");

  function cycleStatus(id: number, current: Status) {
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onUpdate(id, { status: next });
  }

  function startEdit(issue: Issue) {
    setEditingId(issue.id);
    setEditValues({
      summary: issue.summary,
      affectedResidents: issue.affectedResidents,
      category: issue.category,
      urgency: issue.urgency,
    });
  }

  function saveEdit(id: number) {
    onUpdate(id, editValues);
    setEditingId(null);
    setEditValues({});
  }

  const sorted = sortIssues(issues);
  const filtered = filter === "All" ? sorted : sorted.filter((i) => i.status === filter);
  const counts = {
    All: issues.length,
    Open: issues.filter((i) => i.status === "Open").length,
    "In Progress": issues.filter((i) => i.status === "In Progress").length,
    Resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">

      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 font-medium">
            Committee View
          </p>
          <h1
            className="text-foreground leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Open Issues
          </h1>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 text-sm">
          {(["High", "Medium", "Low"] as Urgency[]).map((u) => (
            <div key={u} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${urgencyDot(u)}`} />
              <span className="text-muted-foreground">{u}</span>
              <span className="font-medium text-foreground">
                {issues.filter((i) => i.urgency === u).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {(["All", "Open", "In Progress", "Resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
              filter === f
                ? "border-accent text-accent font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
            <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${
              filter === f ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Issues table / card grid */}
      <div className="flex flex-col gap-3">
        {filtered.map((issue) => {
          const isEditing = editingId === issue.id;
          const isNew = Date.now() - issue.reportedAt < 60_000 && issue.id > 5;

          return (
            <div
              key={issue.id}
              className={`bg-card border rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-shadow hover:shadow-sm ${
                isNew ? "border-accent/30 ring-1 ring-accent/10" : "border-border"
              }`}
            >
              {/* Left: urgency indicator + summary */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${urgencyDot(issue.urgency)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {isNew && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-white font-semibold tracking-wide uppercase">
                        New
                      </span>
                    )}
                    {issue.flatNumber && (
                      <span className="text-xs text-muted-foreground">Flat {issue.flatNumber}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <input
                      className="w-full text-sm text-foreground border-b border-accent bg-transparent focus:outline-none pb-0.5"
                      value={editValues.summary ?? ""}
                      onChange={(e) => setEditValues((v) => ({ ...v, summary: e.target.value }))}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm text-foreground leading-snug"
                      onDoubleClick={() => startEdit(issue)}
                      title="Double-click to edit"
                    >
                      {issue.summary}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1.5">
                    {isEditing ? (
                      <span className="flex items-center gap-1">
                        Affected:
                        <input
                          type="number"
                          min={1}
                          className="w-10 border-b border-accent bg-transparent text-foreground focus:outline-none text-xs text-center"
                          value={editValues.affectedResidents ?? ""}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              affectedResidents: parseInt(e.target.value) || 1,
                            }))
                          }
                        />
                        residents
                      </span>
                    ) : (
                      `${issue.affectedResidents} affected resident${issue.affectedResidents !== 1 ? "s" : ""}`
                    )}
                  </p>
                </div>
              </div>

              {/* Right: tags + controls */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:justify-end flex-shrink-0">
                {isEditing ? (
                  <>
                    <select
                      value={editValues.category}
                      onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value as Category }))}
                      className="text-xs rounded border border-border bg-secondary px-2 py-1 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={editValues.urgency}
                      onChange={(e) => setEditValues((v) => ({ ...v, urgency: e.target.value as Urgency }))}
                      className="text-xs rounded border border-border bg-secondary px-2 py-1 focus:outline-none"
                    >
                      {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button
                      onClick={() => saveEdit(issue.id)}
                      className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent/90 transition font-medium"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryText(issue.category)}`}>
                      {issue.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${urgencyText(issue.urgency)}`}>
                      {issue.urgency}
                    </span>
                    <button
                      onClick={() => cycleStatus(issue.id, issue.status)}
                      className={`text-xs px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${statusStyle(issue.status)}`}
                      title="Click to advance status"
                    >
                      {issue.status}
                    </button>
                    <button
                      onClick={() => startEdit(issue)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No issues in this category.
          </div>
        )}
      </div>
    </div>
  );
}
