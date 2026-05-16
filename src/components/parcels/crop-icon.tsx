import { Grape, Wheat } from "lucide-react";
import { isFruitCrop, isGrainCrop } from "@/lib/utils/crops";

type CropIconProps = {
  crop: string;
  size?: "small" | "medium" | "large";
};

const sizeClassNames: Record<NonNullable<CropIconProps["size"]>, string> = {
  small: "h-4 w-4",
  medium: "h-5 w-5",
  large: "h-6 w-6",
};

export function CropIcon({ crop, size = "medium" }: CropIconProps) {
  const className = `${sizeClassNames[size]} shrink-0 text-lime-700`;

  if (isGrainCrop(crop)) {
    return <Wheat aria-hidden="true" className={className} />;
  }

  if (isFruitCrop(crop)) {
    return <Grape aria-hidden="true" className={className} />;
  }

  return null;
}
