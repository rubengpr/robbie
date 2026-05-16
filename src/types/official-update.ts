export type OfficialUpdateSeverity = "info" | "alert" | "warning";

export type OfficialUpdateCategory =
  | "water"
  | "weather"
  | "crop-health"
  | "compliance"
  | "subsidy"
  | "field-work"
  | "other";

export type OfficialUpdateSource = {
  title: string;
  url: string;
  domain: string;
  excerpt: string;
};

export type ExtractedOfficialUpdateSource = OfficialUpdateSource & {
  rawContent: string;
};

export type OfficialUpdateFinding = {
  id: string;
  title: string;
  severity: OfficialUpdateSeverity;
  category: OfficialUpdateCategory;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain: string;
  evidence: string;
  farmerImpact: string;
  recommendedAction: string;
};

export type OfficialUpdatesBriefing = {
  areaName: string;
  parcelCount: number;
  updatedAt: string;
  retrievalStatus?: "sources-found" | "no-sources-found";
  websitesCrawled: number;
  alertsFound: number;
  warningsFound: number;
  sources: OfficialUpdateSource[];
  findings: OfficialUpdateFinding[];
  isFallback: boolean;
};
