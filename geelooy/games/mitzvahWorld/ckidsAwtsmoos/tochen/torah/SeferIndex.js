// B"H
/** @file SeferIndex.js @description Physical sefarim owned, read, and learned in MitzvahWorld. */
export const SeferIndex = Object.freeze({
  siddur: { id: "siddur", name: "Siddur", icon: "ס", category: "Sefarim", starter: true, level: 1, passages: ["shemaUnity"], readableText: "The Siddur teaches the first breath: Modeh Ani, Shema, and tefillah as action." },
  tehillim: { id: "tehillim", name: "Tehillim", icon: "נ", category: "Sefarim", starter: true, level: 1, passages: ["tehillimSong"], readableText: "Tehillim turns trouble into song and song into courage." },
  tanya: { id: "tanya", name: "Tanya", icon: "ת", category: "Sefarim", starter: false, level: 2, passages: ["tanyaWarmth"], readableText: "Tanya reveals how the animal soul becomes a vehicle for shlichus." },
  chumash: { id: "chumash", name: "Chumash", icon: "ח", category: "Sefarim", starter: false, level: 2, passages: ["chumashLight"], readableText: "Chumash opens creation and command as a walkable map." },
  mishnah: { id: "mishnah", name: "Mishnah", icon: "מ", category: "Sefarim", starter: false, level: 4, passages: ["mishnahClarity"], readableText: "Mishnah clarifies the field with exact cases and stable vessels." },
  zohar: { id: "zohar", name: "Zohar", icon: "ז", category: "Sefarim", starter: false, level: 6, passages: ["zoharRay"], readableText: "Zohar hints at the hidden light behind airborne and rare creatures." }
});
export const SeferIds = Object.freeze(Object.keys(SeferIndex));
export function seferItem(seferId) {
  const s = SeferIndex[seferId];
  return s ? { id: `sefer_${s.id}`, className: "Sefer", name: s.name, icon: s.icon, category: s.category, seferId: s.id, passageIds: s.passages, readable: true, quantity: 1 } : null;
}
export default SeferIndex;
