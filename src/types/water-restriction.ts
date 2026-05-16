export type WaterRestrictionStatus = "clear" | "monitor" | "restricted" | "unknown";

export type WaterRestrictionSeverity =
  | "none"
  | "vigilance"
  | "alert"
  | "reinforced-alert"
  | "crisis"
  | "unknown";

export type WaterRestrictionRuleStatus =
  | "allowed"
  | "restricted"
  | "prohibited"
  | "check-order";

export type WaterRestrictionRule = {
  id: string;
  label: string;
  status: WaterRestrictionRuleStatus;
  detail: string;
};

export type WaterRestrictionSourceKind =
  | "official-page"
  | "prefectural-order"
  | "dataset"
  | "guidance";

export type WaterRestrictionSource = {
  title: string;
  url: string;
  domain: string;
  kind: WaterRestrictionSourceKind;
  excerpt: string;
};

export type AgricultureNewsPriority = "high" | "medium" | "low";

export type AgricultureNewsItem = {
  id: string;
  title: string;
  date: string;
  priority: AgricultureNewsPriority;
  summary: string;
  action: string;
  sourceDomain: string;
};

export type WaterRestrictionBriefing = {
  areaName: string;
  parcelCount: number;
  scanCadence: string;
  status: WaterRestrictionStatus;
  alertLevel: WaterRestrictionSeverity;
  headline: string;
  summary: string;
  recommendedAction: string;
  newsItems: AgricultureNewsItem[];
  restrictions: WaterRestrictionRule[];
  sources: WaterRestrictionSource[];
  updatedAt: string;
  isFallback: boolean;
};
