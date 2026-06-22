// B"H
/**
 * @file NpcInteractionRuntime.js
 * @description
 * NPC interaction bridge using social hashes and spatial hashing. The Awtsmoos
 * removes the all-NPC sweep: talk asks the nearest grid cell, payloads come
 * from cached social truth, and mission mutations dirty only the affected cache.
 */
import { npcById, npcServices } from "./NpcServiceRegistry.js";
import { gossipPayload, clearNpcSocialCache } from "./GossipRuntime.js";
import { nearestNpcBySpatialHash, markNpcSpatialDirty } from "./NpcSpatialHash.js?v=world-interest-20260621-bh1";
import { acceptQuest, turnInQuest, questOfferPayload, questTurnInPayload, emitMissionUiRefresh } from "../missions/QuestGossipRuntime.js";
import { trainerPayload } from "../trainers/TrainerRuntime.js";
import { openVendor, repairAtVendor } from "../social/VendorRuntime.js";
import { restAtInn } from "../social/InnRuntime.js";
import { bindHearth } from "../social/HearthRuntime.js";
import { openBank } from "../social/BankRuntime.js";
import { openMailbox } from "../social/MailboxRuntime.js";

const OPEN_KEYS = new Set(["KeyF", "KeyC"]);
function emit(olam, name, payload) { if (olam?.ayshPeula) olam.ayshPeula("ui event", name, payload); else globalThis.__MITZVAH_UI_BRIDGE__?.receive?.(name, payload); return payload; }
function selectedNpcId(olam) { const t = olam?.__selectedNpc || olam?.__selectedInteractable || olam?.__selectedCombatTarget; return t?.npcId || t?.id || t?.name || t?.mesh?.userData?.npcId || t?.mesh?.name || null; }
function fallbackOlam(scope) { scope.__MITZVAH_FALLBACK_OLAM__ ||= { player:{ level:8, perutah:120, inventory:{ slots:[] }, mesh:{ position:{ x:0, y:0, z:0 } }, maxHp:100, hp:100 }, ayshPeula:(_type, name, payload) => scope.__MITZVAH_UI_BRIDGE__?.receive?.(name, payload) }; return scope.__MITZVAH_FALLBACK_OLAM__; }
function dirtySocial(olam, reason) { clearNpcSocialCache(olam); markNpcSpatialDirty(olam); olam?.__worldInterestScheduler?.markDirty?.(`npc-social:${reason}`); }

export function nearestInteractableNpc(olam, range = 9) { return nearestNpcBySpatialHash(olam, range); }
export function npcInteractionPayload(olam, npcIdOrNpc) { const id = typeof npcIdOrNpc === "string" ? npcIdOrNpc : (npcIdOrNpc?.id || npcIdOrNpc?.name || npcIdOrNpc?.mesh?.name || selectedNpcId(olam)); const npc = npcById(id) || nearestInteractableNpc(olam) || npcServices()[0]; return npc ? gossipPayload(olam, npc.id) : { open:false, ok:false, reason:"no-nearby-npc" }; }

export function performTalk(olam, npcIdOrNpc = null) {
  const payload = npcInteractionPayload(olam, npcIdOrNpc);
  if (!payload?.npcId && payload?.ok === false) return { ok:false, reason:payload.reason || "no-nearby-npc", payload };
  const npc = npcById(payload.npcId || payload.id) || npcById(npcIdOrNpc) || nearestInteractableNpc(olam) || npcServices()[0] || { name:"nearby villager", role:"Villager" };
  const line = payload.gossip || payload.text || payload.description || `Shalom from ${npc.name || npc.role || "the village"}.`;
  const result = { ok:true, action:"talk", npc, line, payload };
  if (olam) olam.__activeNpcInteraction = payload;
  emit(olam, "npcGossip", { ...payload, open:true, line, npc });
  emitMissionUiRefresh(olam, "npc-talk");
  return result;
}

export function openNpcInteraction(olam, npcIdOrNpc = null) { const payload = npcInteractionPayload(olam, npcIdOrNpc); if (olam) olam.__activeNpcInteraction = payload; emit(olam, "npcGossip", payload); emitMissionUiRefresh(olam, "npc-open"); return payload; }
function serviceResultEvent(kind) { return ({ trainer:"trainerScreen", train:"trainerScreen", vendor:"vendorScreen", repair:"vendorScreen", inn:"innRest", hearth:"hearthBind", bank:"bankScreen", mailbox:"mailboxScreen", guard:"worldAnnouncement", profession:"worldAnnouncement" }[kind] || "servicePanel"); }

export function chooseNpcInteraction(olam, npcId, choiceId) {
  const npc = npcById(npcId);
  if (!npc || !choiceId) return { ok:false, reason:"missing-choice" };
  const [kind, value] = String(choiceId).split(":");
  let result;
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
  dirtySocial(olam, kind);
  emit(olam, serviceResultEvent(kind), result);
  emitMissionUiRefresh(olam, `npc-choice-${kind}`);
  return result;
}

export function installNpcInteractionControls(scope = globalThis, olamGetter = () => scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam || scope.mana?.olam || fallbackOlam(scope)) {
  if (scope.__MITZVAH_NPC_INTERACTION__) return scope.__MITZVAH_NPC_INTERACTION__;
  const get = () => olamGetter() || fallbackOlam(scope);
  const api = { open:(id = null) => openNpcInteraction(get(), id), talk:(id = null) => performTalk(get(), id), choose:(npcId, choiceId) => chooseNpcInteraction(get(), npcId, choiceId), nearest:() => nearestInteractableNpc(get()), index:npcInteractionIndex };
  scope.__MITZVAH_NPC_INTERACTION__ = api;
  if (scope.document) scope.document.addEventListener("keydown", e => { if (!e.repeat && OPEN_KEYS.has(e.code)) api.open(); });
  return api;
}

export function npcInteractionIndex() { const npcs = npcServices(); return { npcs, serviceCount:npcs.flatMap(n => n.services).length, socialHashing:true, spatialHashing:true, openKeys:[...OPEN_KEYS] }; }
export default { nearestInteractableNpc, npcInteractionPayload, performTalk, openNpcInteraction, chooseNpcInteraction, installNpcInteractionControls, npcInteractionIndex };
