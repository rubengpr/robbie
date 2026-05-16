import { AppShell } from "@/components/layout/app-shell";
import { OfficialUpdatesBriefing } from "@/components/documents/official-updates-briefing";

export default function DocsPage() {
  return (
    <AppShell>
      <section className="min-w-0 flex-1">
        <OfficialUpdatesBriefing
          areaName="Essonne, France"
          areaLabel={
            <>
              <span>Seeing relevant updates from</span>
              <strong>Essonne Area, France</strong>
            </>
          }
        />
      </section>
    </AppShell>
  );
}
