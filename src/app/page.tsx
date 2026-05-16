import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { ParcelCard } from "@/components/parcels/parcel-card";
import { MetricCard } from "@/components/ui/metric-card";
import { getDemoFarmer } from "@/lib/services/farmers";
import { listParcels } from "@/lib/services/parcels";
import { formatHectares } from "@/lib/utils/format";

export default async function Home() {
  const [farmer, parcels] = await Promise.all([getDemoFarmer(), listParcels()]);
  const totalAreaHa = parcels.reduce((sum, parcel) => sum + parcel.areaHa, 0);
  const attentionCount = parcels.filter(
    (parcel) => parcel.status === "needs-attention",
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="space-y-6">
          <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                  ParcelOps AI
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
                  Farm intelligence dashboard
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Simple parcel readiness for {farmer.name} at{" "}
                  {farmer.farmName}.
                </p>
              </div>
              <div className="rounded-md bg-slate-950 px-4 py-3 text-sm text-white">
                Demo farm · {farmer.region}
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              detail="Real RPG parcel boundaries"
              label="Parcels"
              value={String(farmer.parcelsCount)}
            />
            <MetricCard
              detail="Across demo fields"
              label="Total area"
              value={formatHectares(totalAreaHa)}
            />
            <MetricCard
              detail="Need a closer look"
              label="Attention"
              value={String(attentionCount.length)}
            />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Parcel overview
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Each parcel shows only the basics needed for the demo: name,
                  hectares, and whether it needs attention.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {parcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <AssistantPanel parcels={parcels} />
        </aside>
      </section>
    </main>
  );
}
