// B"H
/** @file TorahCodexRuntime.js @description Local MitzvahWorld codex for route discovery and mastery. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
const empty = () => ({ routes: {}, passages: {}, affinity: { Mishnah: 0, Chassidus: 0, Kabbalah: 0, Niggun: 0, Hitbonenus: 0, Daat: 0 }, fusions: {} });
export function ensureCodex(olam) { const p = playerOf(olam); if (!p) return null; p.torahCodex ||= empty(); p.torahCodex.routes ||= {}; p.torahCodex.passages ||= {}; p.torahCodex.affinity ||= empty().affinity; p.torahCodex.fusions ||= {}; return p.torahCodex; }
export function recordPassageUse(olam, passage = {}) {
  const codex = ensureCodex(olam); if (!codex || !passage.id) return null;
  const route = passage.path?.routeId || passage.routeTitle || passage.seferId || "general";
  codex.routes[route] ||= { id: route, name: passage.routeTitle || route, uses: 0, mastery: 0 };
  codex.routes[route].uses += 1; codex.routes[route].mastery = mastery(codex.routes[route].uses);
  codex.passages[passage.id] = (codex.passages[passage.id] || 0) + 1;
  const cat = passage.category || "Mishnah"; codex.affinity[cat] = (codex.affinity[cat] || 0) + 1;
  unlockFusions(codex); emitCodex(olam); return codex.routes[route];
}
function unlockFusions(codex) { if ((codex.affinity.Mishnah || 0) && (codex.affinity.Chassidus || 0)) codex.fusions.mind_heart = { id: "mind_heart", name: "Mind and Heart" }; if ((codex.affinity.Kabbalah || 0) && (codex.affinity.Niggun || 0)) codex.fusions.hidden_song = { id: "hidden_song", name: "Hidden Song" }; }
function mastery(uses) { return uses >= 15 ? 4 : uses >= 8 ? 3 : uses >= 4 ? 2 : uses >= 2 ? 1 : 0; }
export function soulClass(olam) { const c = ensureCodex(olam) || empty(); const [cat, points] = Object.entries(c.affinity).sort((a, b) => b[1] - a[1])[0] || ["Mishnah", 0]; const names = { Mishnah: "Source Trainer", Chassidus: "Inner Flame", Kabbalah: "Sefirah Weaver", Niggun: "Joy Singer", Hitbonenus: "Quiet Seer", Daat: "Binder" }; return { category: cat, points, name: names[cat] || "Source Trainer" }; }
export function codexPayload(olam) { const c = ensureCodex(olam) || empty(); return { open: false, routes: Object.values(c.routes), passages: c.passages, affinity: c.affinity, fusions: Object.values(c.fusions), soul: soulClass(olam) }; }
export function emitCodex(olam, open = false) { const payload = codexPayload(olam); payload.open = open; olam?.ayshPeula?.("ui event", "torahCodex", payload); return payload; }
export default { ensureCodex, recordPassageUse, codexPayload, emitCodex, soulClass };
