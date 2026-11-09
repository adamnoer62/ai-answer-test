// Manifest of available character layer assets (generated once from the
// provided asset pack — see client/public/assets/office/sprites).
// Every entry's `file` lives at /assets/office/sprites/<file>.

export const SKINS = {
  male: [1, 2, 3, 4, 5].map((i) => ({ id: `male-${i}`, file: `skin-male-${i}.png`, label: `Kulit ${i}` })),
  female: [1, 2, 3, 4, 5].map((i) => ({ id: `female-${i}`, file: `skin-female-${i}.png`, label: `Kulit ${i}` })),
};

export const HAIRS = {
  male: [1, 2, 3, 4, 5].map((i) => ({ id: `male-${i}`, file: `hair-male-${i}.png`, label: `Rambut ${i}` })),
  female: [1, 2, 3, 4, 5].map((i) => ({ id: `female-${i}`, file: `hair-female-${i}.png`, label: `Rambut ${i}` })),
};

const MALE_CLOTHING = [
  "Blue Pants", "Blue Shirt v2", "Boots", "Green Pants", "Green Shirt v2", "Green Underwear",
  "Orange Pants", "Orange Underwear", "Pants", "Purple Pants", "Purple Shirt v2", "Purple Underwear",
  "Red Underwear", "Shirt v2", "Shirt", "Shoes", "Skyblue Underwear", "Underwear", "orange Shirt v2",
];

const FEMALE_CLOTHING = [
  "Blue Corset v2", "Blue Corset", "Blue Panties and Bra", "Boots", "Corset v2", "Corset",
  "Green Corset v2", "Green Corset", "Green Panties and Bra", "Green Socks", "Orange Corset v2",
  "Orange Corset", "Orange Panties and Bra", "Orange Socks", "Purple Corset v2", "Purple Corset",
  "Purple Panties and Bra", "Purple Socks", "Red Panties and Bra", "Red Socks", "Skirt",
  "Skyblue Panties and Bra", "Skyblue Socks", "Socks",
];

function slugify(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Which "slot" a garment belongs to, by keyword — matches how the pack's
// pieces are meant to be layered (top / bottom / socks / shoes).
function classifySlot(label) {
  const l = label.toLowerCase();
  if (l.includes("shirt") || l.includes("corset") || l.includes("panties") || l.includes("underwear")) return "top";
  if (l.includes("pants") || l.includes("skirt")) return "bottom";
  if (l.includes("sock")) return "socks";
  if (l.includes("boot") || l.includes("shoe")) return "shoes";
  return "top";
}

function buildClothing(gender, labels) {
  const bySlot = { top: [], bottom: [], socks: [], shoes: [] };
  for (const label of labels) {
    const slug = slugify(label);
    const item = { id: `${gender}-${slug}`, file: `cloth-${gender}-${slug}.png`, label };
    bySlot[classifySlot(label)].push(item);
  }
  return bySlot;
}

export const CLOTHING = {
  male: buildClothing("male", MALE_CLOTHING),
  female: buildClothing("female", FEMALE_CLOTHING),
};

export function firstOr(list, fallback) {
  return list && list.length ? list[0] : fallback;
}

// A sane default outfit for a gender: first top + first bottom + first shoes
// (+ first socks for female, since that pack has recolored socks).
export function defaultOutfit(gender) {
  const c = CLOTHING[gender];
  return {
    gender,
    skin: SKINS[gender][0].id,
    hair: HAIRS[gender][0].id,
    top: firstOr(c.top, null)?.id || null,
    bottom: firstOr(c.bottom, null)?.id || null,
    socks: firstOr(c.socks, null)?.id || null,
    shoes: firstOr(c.shoes, null)?.id || null,
  };
}

function findById(list, id) {
  return list.find((x) => x.id === id) || null;
}

// Resolve an appearance {gender, skin, hair, top, bottom, socks, shoes}
// (ids) into an ordered list of sprite sheet files to stack, bottom to top.
export function resolveLayers(appearance) {
  if (!appearance) return [];
  const { gender } = appearance;
  const skin = findById(SKINS[gender] || [], appearance.skin);
  const hair = findById(HAIRS[gender] || [], appearance.hair);
  const c = CLOTHING[gender] || { top: [], bottom: [], socks: [], shoes: [] };
  const bottom = findById(c.bottom, appearance.bottom);
  const socks = findById(c.socks, appearance.socks);
  const top = findById(c.top, appearance.top);
  const shoes = findById(c.shoes, appearance.shoes);

  return [skin, socks, bottom, shoes, top, hair].filter(Boolean).map((item) => item.file);
}
