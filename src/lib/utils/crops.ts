const grainCropTerms = ["barley", "cereal", "grain", "oat", "rye", "wheat"];
const fruitCropTerms = [
  "apple",
  "apricot",
  "berry",
  "cherry",
  "fruit",
  "grape",
  "orchard",
  "peach",
  "pear",
  "plum",
  "vine",
];

export function isGrainCrop(crop: string) {
  const normalizedCrop = crop.toLowerCase();

  return grainCropTerms.some((term) => normalizedCrop.includes(term));
}

export function isFruitCrop(crop: string) {
  const normalizedCrop = crop.toLowerCase();

  return fruitCropTerms.some((term) => normalizedCrop.includes(term));
}
