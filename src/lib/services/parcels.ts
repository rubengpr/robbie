import { getParcelRecord, listParcelRecords } from "@/lib/db/parcels";

export async function listParcels() {
  return listParcelRecords();
}

export async function getParcel(id: string) {
  return getParcelRecord(id);
}
