// B"H
/** @file worldMarkers.js @description Screen-space markers that never enter world raycasts. */
export function olamOf(scope = globalThis) { return scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam || scope.mana?.olam || scope.__MITZVAH_FALLBACK_OLAM__ || null; }
function npcPosition(id) { const olam = olamOf(globalThis), list = olam?.npcs || olam?.nivrayim || olam?.interactables || []; const npc = list.find(item => [item.id, item.name, item.mesh?.name, item.mesh?.userData?.npcId].includes(id)); return npc?.mesh?.position || npc?.position || null; }
function project(pos) { const camera = globalThis.__AWTSMOOS_CAMERA__ || globalThis.camera || globalThis.mana?.camera || globalThis.ikar?.camera, THREE = globalThis.THREE; if (!pos || !camera || !THREE?.Vector3) return null; const v = new THREE.Vector3(pos.x || 0, (pos.y || 0) + 3, pos.z || 0).project(camera); return { x:(v.x * .5 + .5) * innerWidth, y:(-v.y * .5 + .5) * innerHeight, projected:true }; }
function fallback(index, count) { const step = Math.min(92, Math.max(46, innerWidth / (Math.max(1, count) + 1))); return { x:Math.min(innerWidth - 44, 44 + index * step), y:128 + (index % 3) * 44, projected:false }; }
export function markerSymbol(marker) { return String(marker || "").includes("question") ? "?" : "!"; }
export function renderWorldQuestMarkers(payload = {}) {
  const root = document.getElementById("mitzvahWorldMarkers"); if (!root) return null;
  const marks = (payload.markers || []).slice(0, 14);
  if (document.documentElement.classList.contains("awtsmoos-hide-world-markers") || !marks.length) { root.replaceChildren(); return root.__awtsmoosMarkerSummary = { count:0, projected:0, hidden:true }; }
  const frag = document.createDocumentFragment(); let projected = 0;
  marks.forEach((mark, index) => { const pos = project(npcPosition(mark.npcId)) || fallback(index, marks.length); if (pos.projected) projected += 1; const el = document.createElement("button"); el.type = "button"; el.className = `mitzvahMarker ${String(mark.marker || "").startsWith("gray") ? "gray" : ""}`.trim(); el.style.cssText = `left:${Math.round(pos.x)}px;top:${Math.round(pos.y)}px`; el.title = `${mark.npcName}: ${mark.title}`; el.textContent = markerSymbol(mark.marker); el.onclick = () => globalThis.__MITZVAH_NPC_INTERACTION__?.open?.(mark.npcId); frag.appendChild(el); });
  root.replaceChildren(frag); return root.__awtsmoosMarkerSummary = { count:marks.length, projected };
}
