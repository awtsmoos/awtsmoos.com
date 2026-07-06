// B"H
/** @file RenderBudgetDiagnostics.js @description Low-cost render tree budget counters. */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function bucketFor(node) {
  const data = node?.userData || {};
  const name = String(node?.name || data.debugName || "").toLowerCase();
  if (data.npcFullGlbVisual) return "npcNearGlb";
  if (data.npcVisualLodPart && /mid_/.test(name)) return "npcMid";
  if (data.npcVisualLodPart && /far_/.test(name)) return "npcFarBlobs";
  if (data.animalLodVisual && /mid_/.test(name)) return "animalMid";
  if (data.animalLodVisual && /far_/.test(name)) return "animalFar";
  if (data.wildlifeActor || /wildlife|animal|rabbit|fox|deer|goat|cow|frog|bird/.test(name)) return "animalNear";
  if (data.friendlyNpc || data.npcTargetRuntime || /npc|chossid|reb /.test(name)) return "npcs";
  if (data.doorState || data.cottageDoor || /door/.test(name)) return "doors";
  if (data.cottageInterior || /interior|room/.test(name)) return "housesInterior";
  if (data.cottage || data.houseId || /cottage|house|roof|window/.test(name)) return "housesExterior";
  if (data.lootable || data.deadWildlifeCorpse || /loot|corpse/.test(name)) return "loot";
  return "world";
}

function matList(material) {
  if (!material) return [];
  return Array.isArray(material) ? material.filter(Boolean) : [material];
}

function trianglesOf(node) {
  const geo = node?.geometry;
  if (!geo) return 0;
  const indexCount = Number(geo.index?.count || 0);
  if (indexCount > 0) return Math.floor(indexCount / 3) * Math.max(1, Number(node.count || 1));
  const posCount = Number(geo.attributes?.position?.count || 0);
  return Math.floor(posCount / 3) * Math.max(1, Number(node.count || 1));
}

function blankBucket() {
  return { meshes:0, visibleMeshes:0, drawCalls:0, triangles:0, transparent:0, skinned:0, instanced:0, shadowCasters:0 };
}
function materialVisible(node) {
  const mats = matList(node?.material);
  return !mats.length || mats.some(mat => mat.visible !== false);
}
function worldVisible(node) {
  for (let cur = node; cur; cur = cur.parent) if (cur.visible === false) return false;
  return materialVisible(node);
}

export function collectRenderBudgetDiagnostics(scene, renderer = null) {
  const started = now();
  const bySubsystem = {};
  const total = blankBucket();
  scene?.traverse?.(node => {
    if (!node || !(node.isMesh || node.isSkinnedMesh || node.isInstancedMesh)) return;
    const bucket = bySubsystem[bucketFor(node)] ||= blankBucket();
	    const visible = worldVisible(node);
    const mats = matList(node.material);
    const matCount = Math.max(1, mats.length);
    const tris = trianglesOf(node);
    for (const row of [bucket, total]) {
      row.meshes += 1;
      if (visible) {
        row.visibleMeshes += 1;
        row.drawCalls += matCount;
        row.triangles += tris;
      }
      if (mats.some(mat => mat.transparent || Number(mat.opacity ?? 1) < 1)) row.transparent += 1;
      if (node.isSkinnedMesh) row.skinned += 1;
      if (node.isInstancedMesh) row.instanced += 1;
      if (node.castShadow) row.shadowCasters += 1;
    }
  });
  const info = renderer?.info?.render || {};
  return {
    at:Date.now(),
    measuredMs:Math.round((now() - started) * 100) / 100,
    renderer:{ calls:Number(info.calls || 0), triangles:Number(info.triangles || 0), points:Number(info.points || 0), lines:Number(info.lines || 0) },
    total,
    bySubsystem,
    seal:"render-budget-diagnostics-20260705-bh1"
  };
}

export function maybeRefreshRenderBudgetDiagnostics(olam, minIntervalMs = 1600) {
  const t = now();
  if (olam.__renderBudgetDiag && t - (olam.__renderBudgetDiagPerfAt || 0) < minIntervalMs) return olam.__renderBudgetDiag;
  const diag = collectRenderBudgetDiagnostics(olam.scene, olam.renderer);
  olam.__renderBudgetDiag = diag;
  olam.__renderBudgetDiagPerfAt = t;
  globalThis.__MITZVAH_RENDER_BUDGET_DIAG__ = () => diag;
  return diag;
}

export default maybeRefreshRenderBudgetDiagnostics;
