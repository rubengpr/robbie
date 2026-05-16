import { CropIcon } from "@/components/parcels/crop-icon";
import { ParcelInfoChip } from "@/components/parcels/parcel-info-chip";
import {
  parcelStatusCopy,
  parcelStatusStyles,
} from "@/components/parcels/parcel-status-badge";
import { formatHectares } from "@/lib/utils/format";
import type { Parcel } from "@/types/parcel";

type ParcelCardProps = {
  parcel: Parcel;
};

export function ParcelCard({ parcel }: ParcelCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <CropIcon crop={parcel.crop} />
          <h3 className="text-lg font-semibold text-slate-950">
            {parcel.name}
          </h3>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ParcelInfoChip label={formatHectares(parcel.areaHa)} />
          <ParcelInfoChip label={parcel.crop} />
        </div>
      </div>

      <div
        className={`mt-5 rounded-md border px-4 py-3 ${parcelStatusStyles[parcel.status]}`}
      >
        <p className="text-sm font-medium">Parcel status</p>
        <p className="mt-1 text-3xl font-semibold">
          {parcelStatusCopy[parcel.status]}
        </p>
      </div>
    </article>
  );
}
