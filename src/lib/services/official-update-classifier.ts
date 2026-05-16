import "server-only";

import {
  OFFICIAL_UPDATES_MODEL,
  createOpenAIClient,
} from "@/lib/integrations/openai/client";
import type {
  ExtractedOfficialUpdateSource,
  OfficialUpdateCategory,
  OfficialUpdateFinding,
  OfficialUpdateSeverity,
} from "@/types/official-update";

type ClassifierOutput = {
  findings: Array<{
    title: string;
    severity: OfficialUpdateSeverity;
    category: OfficialUpdateCategory;
    sourceUrl: string;
    evidence: string;
    farmerImpact: string;
    recommendedAction: string;
  }>;
};

const OFFICIAL_UPDATES_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          severity: { type: "string", enum: ["info", "alert", "warning"] },
          category: {
            type: "string",
            enum: [
              "water",
              "weather",
              "crop-health",
              "compliance",
              "subsidy",
              "field-work",
              "other",
            ],
          },
          sourceUrl: { type: "string" },
          evidence: { type: "string" },
          farmerImpact: { type: "string" },
          recommendedAction: { type: "string" },
        },
        required: [
          "title",
          "severity",
          "category",
          "sourceUrl",
          "evidence",
          "farmerImpact",
          "recommendedAction",
        ],
      },
    },
  },
  required: ["findings"],
} as const;

const SYSTEM_PROMPT = [
  "You classify official agriculture and public-source updates for French farmers.",
  "Use only the provided Tavily-extracted source text and metadata.",
  "Do not invent dates, rules, locations, restrictions, sources, or actions.",
  "Focus on impact for parcels, irrigation, field work, compliance, weather risk, crop health, or subsidies.",
  "Severity rubric:",
  "- warning: urgent farmer action is needed now or very soon. Reserve this for clear operational risk like irrigation bans, crisis restrictions, immediate weather danger, disease/pest outbreaks requiring fast action, or compliance deadlines within 48 hours.",
  "- alert: relevant operational risk, restriction, advisory, monitoring status, or upcoming deadline, but not urgent.",
  "- info: useful context only.",
  "When unsure, downgrade severity.",
  "Every finding must include short evidence grounded in the source text.",
  "Preserve sourceUrl exactly from one of the input sources.",
  "Output user-facing text in English for the demo.",
].join("\n");

export class OfficialUpdateClassifierUnavailableError extends Error {
  constructor() {
    super("Official update classifier unavailable");
  }
}

export class OfficialUpdateClassifierInvalidOutputError extends Error {
  constructor() {
    super("Official update classifier returned invalid output");
  }
}

export async function classifyOfficialUpdates(
  sources: ExtractedOfficialUpdateSource[],
): Promise<OfficialUpdateFinding[]> {
  if (sources.length === 0) {
    return [];
  }

  const client = createOpenAIClient();

  if (!client) {
    throw new OfficialUpdateClassifierUnavailableError();
  }

  const response = await client.responses.create({
    model: OFFICIAL_UPDATES_MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          task: "Classify these official update sources for a farmer in France.",
          sources: sources.map((source) => ({
            title: source.title,
            url: source.url,
            domain: source.domain,
            excerpt: source.excerpt,
            content: source.rawContent,
          })),
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "official_update_findings",
        strict: true,
        schema: OFFICIAL_UPDATES_SCHEMA,
      },
    },
  });

  const parsedOutput = parseClassifierOutput(response.output_text);

  return normalizeFindings(parsedOutput, sources);
}

function parseClassifierOutput(outputText: string): ClassifierOutput {
  try {
    const parsed = JSON.parse(outputText) as unknown;

    if (!isClassifierOutput(parsed)) {
      throw new OfficialUpdateClassifierInvalidOutputError();
    }

    return parsed;
  } catch (error) {
    if (error instanceof OfficialUpdateClassifierInvalidOutputError) {
      throw error;
    }

    throw new OfficialUpdateClassifierInvalidOutputError();
  }
}

function isClassifierOutput(value: unknown): value is ClassifierOutput {
  if (!value || typeof value !== "object" || !("findings" in value)) {
    return false;
  }

  const findings = (value as { findings: unknown }).findings;

  return (
    Array.isArray(findings) &&
    findings.every(
      (finding) =>
        isRecord(finding) &&
        typeof finding.title === "string" &&
        isSeverity(finding.severity) &&
        isCategory(finding.category) &&
        typeof finding.sourceUrl === "string" &&
        typeof finding.evidence === "string" &&
        typeof finding.farmerImpact === "string" &&
        typeof finding.recommendedAction === "string",
    )
  );
}

function normalizeFindings(
  output: ClassifierOutput,
  sources: ExtractedOfficialUpdateSource[],
): OfficialUpdateFinding[] {
  const sourcesByUrl = new Map(sources.map((source) => [source.url, source]));

  return output.findings
    .map((finding) => {
      const source = sourcesByUrl.get(finding.sourceUrl);

      if (!source) {
        return null;
      }

      return {
        id: createFindingId(finding.title, source.url),
        title: compactText(finding.title, 90),
        severity: finding.severity,
        category: finding.category,
        sourceTitle: source.title,
        sourceUrl: source.url,
        sourceDomain: source.domain,
        evidence: compactText(finding.evidence, 240),
        farmerImpact: compactText(finding.farmerImpact, 260),
        recommendedAction: compactText(finding.recommendedAction, 220),
      };
    })
    .filter((finding): finding is OfficialUpdateFinding => finding !== null)
    .slice(0, 6);
}

function createFindingId(title: string, url: string) {
  const slug = `${title}-${url}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);

  return slug || "official-update";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isSeverity(value: unknown): value is OfficialUpdateSeverity {
  return value === "info" || value === "alert" || value === "warning";
}

function isCategory(value: unknown): value is OfficialUpdateCategory {
  return (
    value === "water" ||
    value === "weather" ||
    value === "crop-health" ||
    value === "compliance" ||
    value === "subsidy" ||
    value === "field-work" ||
    value === "other"
  );
}

function compactText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
