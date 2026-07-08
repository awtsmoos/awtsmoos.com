// B"H
/** Quest markers as pure data so UI can render only on changed hashes. */
import { STARTER_MISSIONS } from "./MissionRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function markerForNpc(npcId, missions = []) {
  return missions.some(m => m.giver === npcId) ? "!" : missions.some(m => m.turnIn === npcId) ? "?" : "";
}

export function questMarkersPayload(olamOrNpcs = {}, missions = []) {
  if (Array.isArray(olamOrNpcs)) {
    const markers = olamOrNpcs.map(n => ({ npcId:n.id || n.npcId, marker:markerForNpc(n.id || n.npcId, missions) })).filter(m => m.marker);
    return { count:markers.length, markers };
  }
  const olam = olamOrNpcs || {};
  const active = Object.values(olam.__activeMissions || olam.activeMissions || {});
  const list = active.length ? active : STARTER_MISSIONS;
  const markers = list.map(m => ({ npcId:m.giver || m.turnIn || "rebbe", npcName:String(m.giver || m.turnIn || "Rebbe").replace(/_/g, " "), missionId:m.id, title:m.title, marker:markerForNpc(m.giver, list) || "!" }));
  return { count:markers.length, markers };
}

export default { markerForNpc, questMarkersPayload };
