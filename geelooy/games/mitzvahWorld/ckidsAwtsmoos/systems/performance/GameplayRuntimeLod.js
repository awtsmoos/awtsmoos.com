// B"H
/**
 * @file GameplayRuntimeLod.js
 * @description Dynamic movement LOD: far detail sleeps visually while the
 * world's systems remain alive. During motion, the near path stays visible and
 * far actors/decor fold into later revelation so sustained gameplay can breathe.
 */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const sq = v => v * v;

function playerPosition(olam) {
  return olam?.chossid?.mesh?.position || olam?.player?.mesh?.position || olam?.ayin?.camera?.position || null;
}
function centerOf(node) {
  const e = node?.matrixWorld?.elements;
  if (e && Number.isFinite(Number(e[12])) && Number.isFinite(Number(e[14]))) return { x:Number(e[12]), y:Number(e[13] || 0), z:Number(e[14]) };
  return node?.position || null;
}
function distSq(a, b) {
  if (!a || !b) return 0;
  return sq(num(a.x) - num(b.x)) + sq(num(a.z) - num(b.z));
}
function tagOf(node) {
  const data = node?.userData || {};
  const name = String(node?.name || "").toLowerCase();
  if (data.lodGrass || name.includes("grass") || name.includes("flower")) return "grass";
  if (data.lodForest || name.includes("forest") || name.includes("tree")) return "forest";
  if (data.npcFullGlbVisual || data.friendlyNpc || name.includes("npc")) return "npc";
  if (data.wildlifeActor || data.animalLodVisual || /animal|deer|fox|goat|rabbit|cow|frog|bird|sheep|horse/.test(name)) return "animal";
  if (name.includes("house") || name.includes("roof") || name.includes("door") || name.includes("window")) return "decor";
  if (data.villageDecor || data.skipRaycast || data.noOctree || name.includes("fence")) return "decor";
  return "core";
}
function limitsFor(tier) {
  if (tier === "sprint") return { grass:18, forest:36, decor:30, npc:16, animal:16 };
  if (tier === "speed") return { grass:30, forest:56, decor:42, npc:24, animal:24 };
  return { grass:56, forest:92, decor:66, npc:36, animal:42 };
}
function movementTier(state, pos) {
  if (!state.lastPlayer) return "quality";
  const moved = distSq(pos, state.lastPlayer);
  if (moved > 0.08) return "sprint";
  if (moved > 0.01) return "speed";
  return "quality";
}
function chooseTier(olam, stages, state, pos) {
  const fps = globalThis.__AWTSMOOS_WORKER_GAMEPLAY_FPS__?.fps || 60;
  const render = num(stages.render), total = num(stages.total);
  const calls = olam?.renderer?.info?.render?.calls || 0;
  const moving = movementTier(state, pos);
  if (moving === "sprint") return "sprint";
  if (fps < 58 || render > 10.8 || total > 15.8 || calls > 180) return "sprint";
  if (moving === "speed" || fps < 62 || render > 8.8 || total > 13.8 || calls > 110) return "speed";
  return "quality";
}
function candidate(node) {
  if (!node || node === node.parent) return false;
  if (!(node.isMesh || node.isInstancedMesh || node.isSkinnedMesh || node.isGroup || node.children?.length)) return false;
  if (node.userData?.neverRuntimeLod || node.userData?.playerVisual || node.userData?.heldWeapon) return false;
  return tagOf(node) !== "core";
}
function rememberOriginal(node) {
  if (node.userData.__awtsLodOriginalVisible === undefined) node.userData.__awtsLodOriginalVisible = node.visible !== false;
}
function setVisible(node, visible, reason) {
  rememberOriginal(node);
  const next = visible && node.userData.__awtsLodOriginalVisible !== false;
  if (node.visible !== next) node.visible = next;
  node.userData.__awtsRuntimeLodReason = reason;
}
export function applyGameplayRuntimeLod(olam, stages = {}) {
  const scene = olam?.scene;
  const pos = playerPosition(olam);
  if (!scene || !pos) return null;
  const t = now();
  const state = olam.__gameplayRuntimeLod ||= { at:0, tier:"quality", hidden:0, shown:0, scanned:0, seal:"movement-lod-20260706-bh2" };
  const tier = chooseTier(olam, stages, state, pos);
  const interval = tier === "sprint" ? 16 : tier === "speed" ? 80 : 260;
  if (t - state.at < interval) return olam.__gameplayRuntimeLodDiag || state;
  const limits = limitsFor(tier);
  let hidden = 0, shown = 0, scanned = 0;
  scene.traverse(node => {
    if (!candidate(node)) return;
    scanned += 1;
    const tag = tagOf(node);
    const limit = limits[tag] || 40;
    const d2 = distSq(centerOf(node), pos);
    const keep = d2 <= sq(limit);
    const was = node.visible !== false;
    setVisible(node, keep, keep ? `near-${tag}` : `far-${tag}-${tier}`);
    if (was && !keep) hidden += 1;
    if (!was && keep) shown += 1;
  });
  const player = { x:num(pos.x), y:num(pos.y), z:num(pos.z) };
  Object.assign(state, { at:t, tier, hidden, shown, scanned, limits, player, lastPlayer:player, rendererCalls:olam?.renderer?.info?.render?.calls || 0 });
  olam.__gameplayRuntimeLodDiag = { ...state, atDate:Date.now() };
  globalThis.__MITZVAH_GAMEPLAY_RUNTIME_LOD__ = () => olam.__gameplayRuntimeLodDiag;
  return olam.__gameplayRuntimeLodDiag;
}
export default applyGameplayRuntimeLod;
