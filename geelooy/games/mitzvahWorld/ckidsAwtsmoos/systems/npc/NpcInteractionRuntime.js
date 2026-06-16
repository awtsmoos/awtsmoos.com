// B"H
/** @file NpcInteractionRuntime.js @description Live NPC doorway: keyboard/click bridge, gossip emission, real choice routing, and browser fallback olam. */
import { npcById, npcServices } from "./NpcServiceRegistry.js";
import { gossipPayload } from "./GossipRuntime.js";
import { acceptQuest, turnInQuest, questOfferPayload, questTurnInPayload, emitMissionUiRefresh } from "../missions/QuestGossipRuntime.js";
import { trainerPayload } from "../trainers/TrainerRuntime.js";
import { openVendor, repairAtVendor } from "../social/VendorRuntime.js";
import { restAtInn } from "../social/InnRuntime.js";
import { bindHearth } from "../social/HearthRuntime.js";
import { openBank } from "../social/BankRuntime.js";
import { openMailbox } from "../social/MailboxRuntime.js";
function pos(x) { return x?.mesh?.position || x?.position || {}; }
function dist(a, b) { return Math.hypot((pos(a).x || 0) - (pos(b).x || 0), (pos(a).z || 0) - (pos(b).z || 0)); }
function emit(olam, name, payload) { if (olam?.ayshPeula) olam.ayshPeula("ui event", name, payload); else globalThis.__MITZVAH_UI_BRIDGE__?.receive?.(name, payload); return payload; }
function selectedNpcId(olam) { const t = olam?.__selectedNpc || olam?.__selectedInteractable || olam?.__selectedCombatTarget; return t?.npcId || t?.id || t?.name || t?.mesh?.userData?.npcId || t?.mesh?.name || null; }
function fallbackOlam(scope) { scope.__MITZVAH_FALLBACK_OLAM__ ||= { player:{ level:8, perutah:120, inventory:{ slots:[] }, mesh:{ position:{ x:0, y:0, z:0 } }, maxHp:100, hp:100 }, ayshPeula:(_type, name, payload) => scope.__MITZVAH_UI_BRIDGE__?.receive?.(name, payload) }; return scope.__MITZVAH_FALLBACK_OLAM__; }
export function nearestInteractableNpc(olam, range = 9) { const p = olam?.player || olam?.chossid, npcs = olam?.npcs || olam?.nivrayim || olam?.interactables || []; let best = null, d = Infinity; for (const n of npcs) { const key = n.id || n.name || n.mesh?.name || n.mesh?.userData?.npcId; const svc = npcById(key); if (!svc || !p) continue; const nd = dist(p, n); if (nd < d && nd <= range) { best = svc; d = nd; } } return best; }
export function npcInteractionPayload(olam, npcIdOrNpc) { const id = typeof npcIdOrNpc === "string" ? npcIdOrNpc : (npcIdOrNpc?.id || npcIdOrNpc?.name || npcIdOrNpc?.mesh?.name || selectedNpcId(olam)); const npc = npcById(id) || nearestInteractableNpc(olam) || npcServices()[0]; return npc ? gossipPayload(olam, npc.id) : { open:false, ok:false, reason:"no-nearby-npc" }; }
export function openNpcInteraction(olam, npcIdOrNpc = null) { const payload = npcInteractionPayload(olam, npcIdOrNpc); if (olam) olam.__activeNpcInteraction = payload; emit(olam, "npcGossip", payload); emitMissionUiRefresh(olam, "npc-open"); return payload; }
function serviceResultEvent(kind) { return ({ trainer:"trainerScreen", train:"trainerScreen", vendor:"vendorScreen", repair:"vendorScreen", inn:"innRest", hearth:"hearthBind", bank:"bankScreen", mailbox:"mailboxScreen", guard:"worldAnnouncement", profession:"worldAnnouncement" }[kind] || "servicePanel"); }
export function chooseNpcInteraction(olam, npcId, choiceId) { const npc = npcById(npcId); if (!npc || !choiceId) return { ok:false, reason:"missing-choice" }; const [kind, value] = String(choiceId).split(":"); let result;
  if (kind === "accept") result = acceptQuest(olam, value);
  else if (kind === "turnin") result = turnInQuest(olam, value);
  else if (kind === "offer") result = questOfferPayload(olam, value);
  else if (kind === "complete") result = questTurnInPayload(olam, value);
  else if (kind === "trainer" || kind === "train") result = trainerPayload(olam, value || npc.trainerId);
  else if (kind === "vendor") result = openVendor(olam, value || npc.vendorId || "vendor");
  else if (kind === "repair") result = repairAtVendor(olam);
  else if (kind === "inn") result = restAtInn(olam, value || npc.innId || "village_inn");
  else if (kind === "hearth") result = bindHearth(olam, value || npc.innId || "village_inn");
  else if (kind === "bank") result = openBank(olam);
  else if (kind === "mailbox") result = openMailbox(olam);
  else if (kind === "guard") result = { ok:true, title:"Guard", text:"Safe roads are guarded; elites require preparation." };
  else if (kind === "profession") result = { ok:true, title:"Profession", text:"Profession lessons begin with tools, materials, and patience." };
  else result = { ok:false, reason:"unknown-choice", choiceId };
  emit(olam, serviceResultEvent(kind), result); emitMissionUiRefresh(olam, `npc-choice-${kind}`); return result;
}
export function installNpcInteractionControls(scope = globalThis, olamGetter = () => scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam || scope.mana?.olam || fallbackOlam(scope)) { if (scope.__MITZVAH_NPC_INTERACTION__) return scope.__MITZVAH_NPC_INTERACTION__; const get = () => olamGetter() || fallbackOlam(scope); const api = { open:(id = null) => openNpcInteraction(get(), id), choose:(npcId, choiceId) => chooseNpcInteraction(get(), npcId, choiceId), nearest:() => nearestInteractableNpc(get()), index:npcInteractionIndex };
  scope.__MITZVAH_NPC_INTERACTION__ = api;
  if (scope.document) scope.document.addEventListener("keydown", e => { if (e.repeat) return; if (["KeyF", "KeyE"].includes(e.code)) api.open(); });
  return api;
}
export function npcInteractionIndex() { return { npcs:npcServices(), serviceCount:npcServices().flatMap(n => n.services).length }; }
export default { nearestInteractableNpc, npcInteractionPayload, openNpcInteraction, chooseNpcInteraction, installNpcInteractionControls, npcInteractionIndex };
