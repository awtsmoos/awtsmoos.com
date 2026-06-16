// B"H
/**
 * @file TorahAffinityMatrix.js
 * @description
 * Chapter 627: The Awtsmoos teaches the combat vessel not to confuse a plain
 * sword strike with an absent Torah passage. Null is now refined into a safe
 * empty passage, so every attack may resolve affinity without crashing.
 */
const CATEGORY = Object.freeze({ pshat: "Mishnah", remez: "Chassidus", drush: "Chassidus", sod: "Kabbalah", water: "Niggun" });
function passageData(passage) { return passage && typeof passage === "object" ? passage : {}; }
function data(target) { return target?.mesh?.userData || target?.userData || {}; }
function species(target) { return target?.def?.species || data(target).species || "target"; }
function categoryOf(passage) { const p = passageData(passage); return p.category || CATEGORY[p.level] || CATEGORY[p.element] || "Mishnah"; }
export function torahAffinityMultiplier(target, passage) {
  const cat = categoryOf(passage), d = data(target), s = species(target);
  let m = 1;
  if (cat === "Mishnah" && ["frog", "goat", "deer", "rabbit"].includes(s)) m += 0.16;
  if (cat === "Mishnah" && /confus|erratic|panic/i.test(d.emotion || "")) m += 0.22;
  if (cat === "Chassidus" && ["fox", "wolf"].includes(s)) m += 0.28;
  if (cat === "Chassidus" && /anger|ego|predator/i.test(`${d.emotion || ""} ${d.faction || ""}`)) m += 0.18;
  if (cat === "Kabbalah" && (s === "bird" || d.airborne || d.hidden)) m += 0.34;
  if (cat === "Niggun" && /panic|fear|aggressive/i.test(d.emotion || "")) m += 0.3;
  if (cat === "Hitbonenus") m += d.ecosystemPressure ? 0.2 : 0.08;
  if (cat === "Daat") m += 0.18;
  return Math.max(0.65, Math.min(1.85, m));
}
export function resistanceMultiplier(target, passage) {
  const cat = categoryOf(passage), s = species(target);
  if (cat === "Kabbalah" && ["goat", "deer"].includes(s)) return 0.9;
  if (cat === "Mishnah" && s === "bird") return 0.92;
  return 1;
}
export function affinityLabel(target, passage) {
  const cat = categoryOf(passage), m = torahAffinityMultiplier(target, passage);
  if (m >= 1.3) return `${cat} strong`;
  if (m <= 0.9) return `${cat} resisted`;
  return cat;
}
export default { torahAffinityMultiplier, resistanceMultiplier, affinityLabel };
