import type { ParcelStatus } from "@/types/parcel";

type ParcelStatusBadgeProps = {
  status: ParcelStatus;
  size?: "small" | "large";
};

export const parcelStatusCopy: Record<ParcelStatus, string> = {
  "all-good": "All good",
  "needs-attention": "Needs attention",
};

export const parcelStatusStyles: Record<ParcelStatus, string> = {
  "all-good": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "needs-attention": "border-amber-200 bg-amber-50 text-amber-900",
};

const sizeClassNames: Record<NonNullable<ParcelStatusBadgeProps["size"]>, string> = {
  small: "px-2 py-0.5 text-xs",
  large: "px-3 py-1 text-sm",
};

export function ParcelStatusBadge({
  status,
  size = "small",
}: ParcelStatusBadgeProps) {
  return (
    <span
      className={`rounded-full border font-semibold ${sizeClassNames[size]} ${parcelStatusStyles[status]}`}
    >
      {parcelStatusCopy[status]}
    </span>
  );
}
