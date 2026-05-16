import { AppShell } from "@/components/layout/app-shell";
import { MapWorkspace } from "@/components/map/map-workspace";
import { listParcels } from "@/lib/services/parcels";

export default async function MapPage() {
  const parcels = await listParcels();

  return (
    <AppShell>
      <MapWorkspace parcels={parcels} />
    </AppShell>
  );
}
