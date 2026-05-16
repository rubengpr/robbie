"use client";

import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CloudRain,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ParcelMap } from "@/components/map/parcel-map";
import { CropIcon } from "@/components/parcels/crop-icon";
import { ParcelInfoChip } from "@/components/parcels/parcel-info-chip";
import {
  ParcelStatusBadge,
  parcelStatusCopy,
  parcelStatusStyles,
} from "@/components/parcels/parcel-status-badge";
import {
  formatExpectedHarvestDate,
  formatHectares,
} from "@/lib/utils/format";
import type { Parcel, ParcelStatus } from "@/types/parcel";

type MapWorkspaceProps = {
  parcels: Parcel[];
};

const statusIcons: Record<ParcelStatus, LucideIcon> = {
  "all-good": CircleCheck,
  "needs-attention": TriangleAlert,
};

export function MapWorkspace({ parcels }: MapWorkspaceProps) {
  const [selectedParcelId, setSelectedParcelId] = useState(parcels[0]?.id ?? "");
  const [isParcelListOpen, setIsParcelListOpen] = useState(true);
  const selectedParcel = useMemo(
    () =>
      parcels.find((parcel) => parcel.id === selectedParcelId) ??
      parcels[0] ??
      null,
    [parcels, selectedParcelId],
  );
  const handleSelectParcel = useCallback((parcelId: string) => {
    setSelectedParcelId(parcelId);
  }, []);

  if (!selectedParcel) {
    return (
      <section className="grid flex-1 place-items-center bg-slate-950 text-white">
        <p>No demo parcels available.</p>
      </section>
    );
  }

  return (
    <>
      <aside className="flex w-[390px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
        <section className="border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <CropIcon crop={selectedParcel.crop} size="large" />
              <h1 className="text-2xl font-semibold text-slate-950">
                {selectedParcel.name}
              </h1>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ParcelInfoChip label={formatHectares(selectedParcel.areaHa)} />
              <ParcelInfoChip label={selectedParcel.crop} />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <KpiRow
              icon={statusIcons[selectedParcel.status]}
              label="Parcel status"
              value={parcelStatusCopy[selectedParcel.status]}
              className={parcelStatusStyles[selectedParcel.status]}
            />
            <KpiRow
              icon={CloudRain}
              label="Rain next 48h"
              value={`${selectedParcel.rainfallMmNext48h} mm`}
            />
            <KpiRow
              icon={CalendarDays}
              label="Harvest"
              value={formatExpectedHarvestDate(selectedParcel.harvestDays)}
            />
          </div>
        </section>

        <section className="border-b border-slate-200 px-6 py-5">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setIsParcelListOpen((isOpen) => !isOpen)}
            aria-expanded={isParcelListOpen}
            aria-controls="parcel-list"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              My parcels
            </h2>
            <span className="flex items-center gap-2">
              <span className="rounded-md bg-lime-50 px-2 py-1 text-xs font-semibold text-lime-800">
                {parcels.length} fields
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 text-slate-500 transition ${
                  isParcelListOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {isParcelListOpen ? (
            <div id="parcel-list" className="mt-4 space-y-2">
              {parcels.map((parcel) => (
                <button
                  key={parcel.id}
                  type="button"
                  onClick={() => handleSelectParcel(parcel.id)}
                  className={`w-full rounded-md border px-4 py-3 text-left transition ${
                    parcel.id === selectedParcel.id
                      ? "border-lime-500 bg-lime-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-lime-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-950">
                      <CropIcon crop={parcel.crop} size="small" />
                      <span className="truncate">{parcel.name}</span>
                    </span>
                    <ParcelStatusBadge status={parcel.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatHectares(parcel.areaHa)}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </aside>

      <section className="min-w-0 flex-1">
        <ParcelMap
          parcels={parcels}
          selectedParcelId={selectedParcel.id}
          onSelectParcel={handleSelectParcel}
        />
      </section>
    </>
  );
}

function KpiRow({
  className = "border-slate-200 bg-slate-50 text-slate-950",
  icon: Icon,
  label,
  value,
}: {
  className?: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 ${className}`}
    >
      <span className="flex items-center gap-2 text-sm font-medium opacity-75">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
