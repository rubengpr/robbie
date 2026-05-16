"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { formatHectares } from "@/lib/utils/format";
import type { Parcel } from "@/types/parcel";

type ParcelMapProps = {
  parcels: Parcel[];
  selectedParcelId: string;
  onSelectParcel: (parcelId: string) => void;
};

function getStatusStyle(status: Parcel["status"]) {
  if (status === "needs-attention") {
    return { color: "#facc15", fillColor: "#fef08a", fillOpacity: 0.42 };
  }
  return { color: "#22c55e", fillColor: "#bbf7d0", fillOpacity: 0.24 };
}

export function ParcelMap({
  parcels,
  selectedParcelId,
  onSelectParcel,
}: ParcelMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const parcelLayerRef = useRef<LayerGroup | null>(null);
  const hasFitBoundsRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    async function renderMap() {
      const L = await import("leaflet");

      if (isCancelled || !containerRef.current) {
        return;
      }

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          attributionControl: true,
          zoomControl: false,
        }).setView([48.6371, 2.6449], 14);

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri",
            maxZoom: 19,
          },
        ).addTo(mapRef.current);

        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
      }

      if (parcelLayerRef.current) {
        parcelLayerRef.current.remove();
      }

      const parcelLayer = L.layerGroup();

      parcels.forEach((parcel) => {
        const isSelected = parcel.id === selectedParcelId;
        const style = getStatusStyle(parcel.status);
        const polygon = L.polygon(
          parcel.boundary.map((point) => [point.lat, point.lng]),
          {
            color: isSelected ? "#fef08a" : style.color,
            fillColor: style.fillColor,
            fillOpacity: isSelected ? 0.55 : style.fillOpacity,
            opacity: 0.98,
            weight: isSelected ? 4 : 2.5,
          },
        );

        polygon.on("click", () => onSelectParcel(parcel.id));
        polygon.bindTooltip(
          `${parcel.name} · ${formatHectares(parcel.areaHa)} · ${parcel.status === "needs-attention" ? "needs attention" : "all good"}`,
          {
            direction: "top",
            opacity: 0.92,
            sticky: true,
          },
        );
        polygon.addTo(parcelLayer);
      });

      parcelLayer.addTo(mapRef.current);
      parcelLayerRef.current = parcelLayer;

      if (!hasFitBoundsRef.current) {
        const bounds = L.featureGroup(
          parcelLayer.getLayers().map((layer) => layer),
        ).getBounds();

        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            paddingBottomRight: [80, 80],
            paddingTopLeft: [80, 80],
          });
          hasFitBoundsRef.current = true;
        }
      }
    }

    void renderMap();

    return () => {
      isCancelled = true;
    };
  }, [onSelectParcel, parcels, selectedParcelId]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden bg-slate-900">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-5 top-5 rounded-md border border-white/25 bg-slate-950/70 px-4 py-3 text-white shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">
          Satellite view
        </p>
        <p className="mt-1 text-sm text-white/85">
          Real RPG parcel boundaries near Paris
        </p>
      </div>
    </div>
  );
}
