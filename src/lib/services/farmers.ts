import { getFarmer } from "@/lib/db/farmers";

export async function getDemoFarmer() {
  return getFarmer();
}
