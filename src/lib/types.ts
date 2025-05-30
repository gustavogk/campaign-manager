export type CampaignStatus = "active" | "paused" | "expired";

export type CampaignCategory =
  | "marketing"
  | "sales"
  | "product"
  | "events"
  | "other";

export interface Campaign {
  id: string;
  name: string;
  createdAt: string; // ISO string (convertido com `new Date(...)` se necessário)
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  category: CampaignCategory;
  deletedAt?: string | null;
}
