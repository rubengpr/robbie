export function formatHectares(areaHa: number) {
  return `${Math.round(areaHa)} ha`;
}

export function formatExpectedHarvestDate(harvestDays: number) {
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + harvestDays);

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  }).format(harvestDate);
}
