"use client";

import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  FileSearch,
  Globe,
  Info,
  LoaderCircle,
  OctagonAlert,
  Play,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { fetchOfficialUpdatesBriefing } from "@/lib/api/official-updates";
import type { OfficialUpdateSeverity } from "@/types/official-update";
import type { OfficialUpdatesBriefing as OfficialUpdatesBriefingData } from "@/types/official-update";

type OfficialUpdatesBriefingProps = {
  areaName: string;
  areaLabel?: React.ReactNode;
};

type WeeklyUpdate = {
  id: string;
  title: string;
  fetchedAt: string;
  websitesCrawled: number;
  fetchedWebsites: string[];
  alertsFound: number;
  warningsFound: number;
  details: WeeklyUpdateDetail[];
};

type WeeklyUpdateDetail = {
  severity: OfficialUpdateSeverity;
  text: string;
  sourceDomain?: string;
  sourceTitle?: string;
  sourceUrl?: string;
};

const mockUpdates: WeeklyUpdate[] = [
  {
    id: "weekly-scan-current",
    title: "Weekly websites scan",
    fetchedAt: "May 16, 2026",
    websitesCrawled: 3,
    fetchedWebsites: [
      "VigiEau",
      "Essonne Prefecture",
      "Chambre Agriculture IDF",
    ],
    alertsFound: 1,
    warningsFound: 1,
    details: [
      {
        severity: "info",
        text: "Checked official sources for water restrictions, local agriculture guidance, and administrative updates in the Essonne area.",
      },
      {
        severity: "alert",
        text: "Found one alert that may affect irrigation planning this week.",
      },
      {
        severity: "warning",
        text: "Found one warning that should be reviewed before scheduling field work.",
      },
    ],
  },
  {
    id: "irrigation-rules-review",
    title: "Irrigation rules review",
    fetchedAt: "May 9, 2026",
    websitesCrawled: 4,
    fetchedWebsites: [
      "VigiEau",
      "Essonne Prefecture",
      "Service-Public.fr",
      "Data.gouv.fr",
    ],
    alertsFound: 0,
    warningsFound: 2,
    details: [
      {
        severity: "info",
        text: "Reviewed public drought status pages and administrative publications for irrigation guidance near the demo parcels.",
      },
      {
        severity: "warning",
        text: "Two guidance updates mentioned checking local orders before watering.",
      },
      {
        severity: "warning",
        text: "Recommended action: confirm the parcel water source before scheduling sprinkler irrigation.",
      },
    ],
  },
  {
    id: "field-work-advisory",
    title: "Field work advisory scan",
    fetchedAt: "May 2, 2026",
    websitesCrawled: 5,
    fetchedWebsites: [
      "Chambre Agriculture IDF",
      "Meteo-France",
      "Essonne Prefecture",
      "Ecologie.gouv.fr",
      "Service-Public.fr",
    ],
    alertsFound: 2,
    warningsFound: 1,
    details: [
      {
        severity: "info",
        text: "Combined public weather advisories, local agriculture notes, and official administrative pages for the farm area.",
      },
      {
        severity: "alert",
        text: "Found two alerts relevant to field scheduling: dry conditions and local water-use monitoring.",
      },
      {
        severity: "warning",
        text: "Suggested action: delay non-urgent irrigation and prioritize visual checks on the higher-risk parcel.",
      },
    ],
  },
];

const initialExpandedUpdateIds = [mockUpdates[0].id];

const emptyLiveUpdate: WeeklyUpdate = {
  id: "weekly-scan-current",
  title: "Weekly websites scan",
  fetchedAt: "May 16, 2026",
  websitesCrawled: 0,
  fetchedWebsites: [],
  alertsFound: 0,
  warningsFound: 0,
  details: [],
};

export function OfficialUpdatesBriefing({
  areaName,
  areaLabel,
}: OfficialUpdatesBriefingProps) {
  const [expandedUpdateIds, setExpandedUpdateIds] = useState<string[]>(
    initialExpandedUpdateIds,
  );
  const [liveUpdate, setLiveUpdate] = useState<WeeklyUpdate | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggle(updateId: string) {
    setExpandedUpdateIds((currentIds) =>
      currentIds.includes(updateId)
        ? currentIds.filter((currentId) => currentId !== updateId)
        : [...currentIds, updateId],
    );
  }

  async function handleRunLiveScan() {
    setIsRunning(true);
    setError(null);

    try {
      const briefing = await fetchOfficialUpdatesBriefing();
      const nextUpdate = mapBriefingToWeeklyUpdate(briefing);
      setLiveUpdate(nextUpdate);
      setExpandedUpdateIds((currentIds) =>
        currentIds.includes(nextUpdate.id)
          ? currentIds
          : [...currentIds, nextUpdate.id],
      );
    } catch {
      setError("Live scan unavailable.");
    } finally {
      setIsRunning(false);
    }
  }

  const updates = [liveUpdate ?? emptyLiveUpdate, ...mockUpdates.slice(1)];

  return (
    <div className="h-full min-h-[520px] overflow-y-auto bg-[#f3f6ef]">
      <div className="flex min-h-full w-full flex-col gap-6 px-8 py-8 xl:px-12 xl:py-10">
        <header>
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
            Latest news
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Official agriculture updates for the farm area, collected from
            whitelisted local public sources each week.
          </p>
          <p className="mt-3 inline-flex gap-1 rounded-full border border-slate-200 bg-white px-3 py-0.5 text-xs font-normal text-slate-600">
            {areaLabel ?? areaName}
          </p>
        </header>

        <div className="space-y-3">
          {updates.map((update, index) => (
            <WeeklyUpdateCard
              key={update.id}
              error={index === 0 ? error : null}
              hasResults={index !== 0 || liveUpdate !== null}
              isExpanded={expandedUpdateIds.includes(update.id)}
              isRunning={index === 0 ? isRunning : false}
              onToggle={() => handleToggle(update.id)}
              onRunLiveScan={index === 0 ? handleRunLiveScan : undefined}
              update={update}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklyUpdateCard({
  error,
  hasResults = true,
  isExpanded,
  isRunning,
  onToggle,
  onRunLiveScan,
  update,
}: {
  error?: string | null;
  hasResults?: boolean;
  isExpanded: boolean;
  isRunning?: boolean;
  onToggle: () => void;
  onRunLiveScan?: () => void;
  update: WeeklyUpdate;
}) {
  const infoFound = countDetailsBySeverity(update.details, "info");
  const alertsFound = countDetailsBySeverity(update.details, "alert");
  const warningsFound = countDetailsBySeverity(update.details, "warning");

  return (
    <article className="w-full rounded-md border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-slate-600"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-label={
                isExpanded ? "Collapse weekly update" : "Expand weekly update"
              }
            >
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition ${isExpanded ? "" : "-rotate-90"}`}
              />
            </button>
            <h3 className="text-lg font-semibold text-slate-950">
              {update.title}
            </h3>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-normal text-slate-800"
              aria-label={`Fetched on ${update.fetchedAt}`}
            >
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
              {update.fetchedAt}
            </span>
            {onRunLiveScan ? (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-lime-200 bg-lime-50 px-2 text-[10px] font-semibold leading-3 text-lime-700 transition hover:border-lime-300 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onRunLiveScan}
                disabled={isRunning}
                aria-label="Run live official updates scan"
              >
                {isRunning ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin"
                  />
                ) : (
                  <Play aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                Run
              </button>
            ) : null}
          </div>
          {error ? (
            <p className="mt-2 text-sm font-medium text-red-700">{error}</p>
          ) : null}
        </div>

        {hasResults && !isRunning ? (
          <div className="flex flex-wrap gap-2">
            <ScanMetric
              icon={FileSearch}
              label="Info found"
              value={infoFound}
              className="border-slate-200 bg-slate-50 text-slate-800"
            />
            <ScanMetric
              icon={TriangleAlert}
              label="Alerts found"
              value={alertsFound}
              className="border-amber-200 bg-amber-50 text-amber-950"
            />
            <ScanMetric
              icon={OctagonAlert}
              label="Warnings found"
              value={warningsFound}
              className="border-red-200 bg-red-50 text-red-900"
            />
          </div>
        ) : null}
      </div>

      {hasResults && isExpanded && !isRunning ? (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Globe aria-hidden="true" className="h-3 w-3" />
              Fetched websites
            </span>
            {update.fetchedWebsites.map((website) => (
              <span
                key={website}
                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] leading-4 text-slate-700"
              >
                {website}
              </span>
            ))}
          </div>
          <GroupedDetails details={update.details} />
        </div>
      ) : null}
    </article>
  );
}

function countDetailsBySeverity(
  details: WeeklyUpdateDetail[],
  severity: OfficialUpdateSeverity,
) {
  return details.filter((detail) => detail.severity === severity).length;
}

function GroupedDetails({ details }: { details: WeeklyUpdateDetail[] }) {
  const groups: {
    severity: OfficialUpdateSeverity;
    title: string;
    icon: LucideIcon;
    className: string;
    headingClassName: string;
  }[] = [
    {
      severity: "warning",
      title: "Warnings",
      icon: OctagonAlert,
      className: "border-red-100 bg-red-50 text-red-950",
      headingClassName: "text-red-800",
    },
    {
      severity: "alert",
      title: "Alerts",
      icon: TriangleAlert,
      className: "border-amber-100 bg-amber-50 text-amber-950",
      headingClassName: "text-amber-800",
    },
    {
      severity: "info",
      title: "Info",
      icon: Info,
      className: "border-slate-100 bg-slate-50 text-slate-700",
      headingClassName: "text-slate-500",
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const groupDetails = details.filter(
          (detail) => detail.severity === group.severity,
        );

        if (groupDetails.length === 0) {
          return null;
        }

        return (
          <section key={group.severity}>
            <h4
              className={`mb-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-normal ${group.headingClassName}`}
            >
              <group.icon aria-hidden="true" className="h-3.5 w-3.5" />
              {group.title}
            </h4>
            <ul className="space-y-2 text-sm leading-6">
              {groupDetails.map((detail) => (
                <li
                  key={detail.text}
                  className={`flex items-start gap-3 rounded-md border px-3 py-2 ${group.className}`}
                >
                  <span className="min-w-0 flex-1">{detail.text}</span>
                  {detail.sourceUrl ? (
                    <a
                      href={detail.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-current/15 bg-white/60 transition hover:bg-white"
                      aria-label={`Open source: ${detail.sourceTitle ?? detail.sourceDomain ?? "official update"}`}
                      title={detail.sourceDomain ?? "Open source"}
                    >
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function mapBriefingToWeeklyUpdate(
  briefing: OfficialUpdatesBriefingData,
): WeeklyUpdate {
  const fetchedWebsites = Array.from(
    new Set(briefing.sources.map((source) => source.domain)),
  );

  return {
    id: "live-official-updates",
    title: "Live official updates scan",
    fetchedAt: formatDate(briefing.updatedAt),
    websitesCrawled: briefing.websitesCrawled,
    fetchedWebsites,
    alertsFound: briefing.alertsFound,
    warningsFound: briefing.warningsFound,
    details:
      briefing.findings.length > 0
        ? briefing.findings.map(
            (finding): WeeklyUpdateDetail => ({
              severity: finding.severity,
              text: `${finding.farmerImpact} Recommended action: ${finding.recommendedAction}`,
              sourceDomain: finding.sourceDomain,
              sourceTitle: finding.sourceTitle,
              sourceUrl: finding.sourceUrl,
            }),
          )
        : [
            {
              severity: "info",
              text: "No urgent farmer-facing alerts or warnings were found in the retrieved official sources.",
            },
          ],
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ScanMetric({
  className,
  icon: Icon,
  label,
  value,
}: {
  className: string;
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-normal ${className}`}
      aria-label={`${label}: ${value}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{value}</span>
    </div>
  );
}
