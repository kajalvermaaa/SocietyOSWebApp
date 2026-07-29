export type Urgency = "High" | "Medium" | "Low";
export type Status = "Open" | "In Progress" | "Resolved";
export type Category = "Lift" | "Plumbing" | "Electrical" | "Security" | "Other";

export interface Issue {
  id: number;
  summary: string;
  category: Category;
  urgency: Urgency;
  affectedResidents: number;
  status: Status;
  flatNumber?: string;
  reportedAt: number; // timestamp for ordering new issues last
}
