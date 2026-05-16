import type { Farmer } from "@/types/farmer";

const demoFarmer: Farmer = {
  id: "farmer-1",
  name: "Claire Martin",
  farmName: "Ferme du Plateau",
  region: "Ile-de-France",
  parcelsCount: 4,
};

export async function getFarmer() {
  return demoFarmer;
}
