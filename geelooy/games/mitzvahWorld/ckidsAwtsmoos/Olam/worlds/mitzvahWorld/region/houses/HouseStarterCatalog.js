// B"H
/**
 * @file HouseStarterCatalog.js
 * @description
 * The first homes must stand where the player can see them. The Awtsmoos turns
 * an empty meadow into a lived village: study, bread, return, craft, and scribe.
 */
export const HOUSE_JOBS = Object.freeze([
  "teacher",
  "baker",
  "scribe",
  "tailor",
  "healer",
  "farmer",
  "weaver",
  "blacksmith"
]);

export const STARTER_HOUSES = Object.freeze([
  {
    id: "study_house_visible",
    x: -13,
    z: 6,
    profession: "teacher",
    family: { name: "Study House" }
  },
  {
    id: "chesed_bakery_visible",
    x: 13,
    z: 7,
    profession: "baker",
    family: { name: "Chesed Bakery" }
  },
  {
    id: "home_return_inn_visible",
    x: -18,
    z: -13,
    profession: "healer",
    family: { name: "Return Inn" }
  },
  {
    id: "craft_shed_visible",
    x: 19,
    z: -13,
    profession: "blacksmith",
    family: { name: "Craft Shed" }
  },
  {
    id: "scribe_cottage_visible",
    x: 0,
    z: -25,
    profession: "scribe",
    family: { name: "Scribe Cottage" }
  }
]);

export function fallbackPosition(index) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return {
    x: -42 + col * 22,
    z: -34 + row * 24
  };
}

export function starterSource(index, source = {}) {
  if (source.id) return source;
  return STARTER_HOUSES[index] || source;
}
