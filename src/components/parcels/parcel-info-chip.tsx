type ParcelInfoChipProps = {
  label: string;
};

export function ParcelInfoChip({ label }: ParcelInfoChipProps) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}
