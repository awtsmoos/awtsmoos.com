// B"H
/**
 * Existing gameplay runtime LOD: keep terrain/player/camera gameplay alive,
 * but do not let distant NPC GLBs, animals, grass, fences, and decorative
 * meshes steal the frame from the real controls.
 */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const sq = v => v * v;

function playerActor(olam) { return olam?.chossid || olam?.player || null; }
function playerPosition(olam) { return playerActor(olam)?.mesh?.position || olam?.ayin?.camera?.position || null; }
function dataOf(node) { return node?.userData || {}; }
function nameOf(node) { return String(node?.name || dataOf(node).debugName || "").toLowerCase(); }
function centerOf(node) {
  const e = node?.matrixWorld?.elements;
  if (e && Number.isFinite(Number(e[12])) && Number.isFinite(Number(e[14]))) return { x:Number(e[12]), y:Number(e[13] || 0), z:Number(e[14]) };
  return node?.position || null;
}
function distSq(a, b) { return !a || !b ? 0 : sq(num(a.x) - num(b.x)) + sq(num(a.z) - num(b.z)); }
function isDescendantOf(node, root) { for (let n = node; n; n = n.parent) if (n === root) return true; return false; }
function playerProtected(node, olam) {
  const player = playerActor(olam), mesh = player?.mesh || player?.model || player?.guf;
  return Boolean(player && (node === player || node === mesh || isDescendantOf(node, mesh)));
}
function terrainProtected(node) {
  const d = dataOf(node), name = nameOf(node);
  return Boolean(d.awtsmoosTerrainLaw || d.isTerrain || d.proceduralTerrain || d.terrainRoot || d.terrainMesh || d.walkableGround || /terrain|walkable_ground|ground_with/.test(name));
}
function gameplayProtected(node, olam) {
  const d = dataOf(node), name = nameOf(node);
  return Boolean(playerProtected(node, olam) || terrainProtected(node) || d.forceRuntimeVisible || d.heldWeapon || d.playerVisual || /player_camera_anchor/.test(name));
}
function forceVisible(node, reason) { node.visible = true; node.frustumCulled = false; node.userData ||= {}; node.userData.__awtsRuntimeLodReason = reason; }
function tagOf(node) {
  const d = dataOf(node), name = nameOf(node);
  if (d.npcFullGlbVisual || d.friendlyNpc || d.mitzvahWorldNpcRoot || d.realChossidGlbNpc || /npc|rebbe|chossid/.test(name)) return "npc";
  if (d.wildlifeActor || d.animalLodVisual || /animal|deer|fox|goat|rabbit|cow|frog|bird|sheep|horse/.test(name)) return "animal";
  if (d.lodGrass || /grass|flower|plant|weed/.test(name)) return "grass";
  if (d.lodForest || /forest|tree|bush/.test(name)) return "forest";
  if (/door|window|fence|bench|table|barrel|wagon|sign|roof|house|cottage|interior|room/.test(name) || d.villageDecor || d.skipRaycast || d.noOctree) return "decor";
  return "core";
}
function limitsFor(tier) {
  if (tier === "emergency") return { grass:7, forest:18, decor:18, npc:9, animal:10 };
  if (tier === "sprint") return { grass:10, forest:26, decor:26, npc:13, animal:14 };
  if (tier === "speed") return { grass:18, forest:38, decor:34, npc:18, animal:20 };
  return { grass:28, forest:56, decor:44, npc:26, animal:30 };
}
function movementTier(state, pos) {
  if (!state.lastPlayer) return "speed";
  const moved = distSq(pos, state.lastPlayer);
  if (moved > .08) return "sprint";
  if (moved > .01) return "speed";
  return "quality";
}
function chooseTier(olam, stages, state, pos) {
  const fps = globalThis.__AWTSMOOS_WORKER_GAMEPLAY_FPS__?.fps || 60;
  const render = num(stages.render), total = num(stages.total), calls = olam?.renderer?.info?.render?.calls || 0;
  const moving = movementTier(state, pos);
  if (fps < 36 || render > 18 || total > 24 || calls > 650) return "emergency";
  if (moving === "sprint" || fps < 52 || render > 11 || total > 16 || calls > 240) return "sprint";
  if (moving === "speed" || fps < 58 || render > 8 || total > 13 || calls > 150) return "speed";
  return "quality";
}
function candidate(node, olam) {
  if (!node || node === node.parent || gameplayProtected(node, olam)) return false;
  if (!(node.isMesh || node.isInstancedMesh || node.isSkinnedMesh || node.isGroup || node.children?.length)) return false;
  const tag = tagOf(node);
  return tag !== "core";
}
function rememberOriginal(node) { if (node.userData.__awtsLodOriginalVisible === undefined) node.userData.__awtsLodOriginalVisible = node.visible !== false; }
function setVisible(node, visible, reason) {
  rememberOriginal(node);
  const next = visible && node.userData.__awtsLodOriginalVisible !== false;
  if (node.visible !== next) node.visible = next;
  node.frustumCulled = !next;
  node.userData.__awtsRuntimeLodReason = reason;
}
export function applyGameplayRuntimeLod(olam, stages = {}) {
  const scene = olam?.scene, pos = playerPosition(olam);
  if (!scene || !pos) return null;
  const t = now(), state = olam.__gameplayRuntimeLod ||= { at:0, tier:"speed", hidden:0, shown:0, scanned:0, protected:0, seal:"existing-gameplay-aggressive-lod-20260708-bh1" };
  const tier = chooseTier(olam, stages, state, pos), interval = tier === "emergency" ? 12 : tier === "sprint" ? 24 : tier === "speed" ? 80 : 180;
  if (t - state.at < interval) return olam.__gameplayRuntimeLodDiag || state;
  const limits = limitsFor(tier); let hidden = 0, shown = 0, scanned = 0, protectedCount = 0;
  scene.traverse(node => {
    if (gameplayProtected(node, olam)) { forceVisible(node, "protected-gameplay"); protectedCount++; return; }
    if (!candidate(node, olam)) return;
    scanned++;
    const tag = tagOf(node), limit = limits[tag] || 24, keep = distSq(centerOf(node), pos) <= sq(limit), was = node.visible !== false;
    setVisible(node, keep, keep ? `near-${tag}` : `far-${tag}-${tier}`);
    if (was && !keep) hidden++;
    if (!was && keep) shown++;
  });
  const player = { x:num(pos.x), y:num(pos.y), z:num(pos.z) };
  Object.assign(state, { at:t, tier, hidden, shown, scanned, protected:protectedCount, limits, player, lastPlayer:player, rendererCalls:olam?.renderer?.info?.render?.calls || 0 });
  olam.__gameplayRuntimeLodDiag = { ...state, atDate:Date.now() };
  globalThis.__MITZVAH_GAMEPLAY_RUNTIME_LOD__ = () => olam.__gameplayRuntimeLodDiag;
  return olam.__gameplayRuntimeLodDiag;
}
export default applyGameplayRuntimeLod;
