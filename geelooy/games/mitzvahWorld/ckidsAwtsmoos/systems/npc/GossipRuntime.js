// B"H
/**
 * @file GossipRuntime.js
 * @description
 * NPC gossip contracts with social hashing. The villager no longer rebuilds
 * quest choices by habit; the payload is born once per mission/social change
 * and then reused like a clear vessel in the hand of the Awtsmoos.
 */
import { npcById } from "./NpcServiceRegistry.js";
import { npcSocialHash, memoBySocialHash } from "./NpcSocialHash.js";
import { availableQuestsForNpc, completeQuestsForNpc, ensureMissionState } from "../missions/QuestGossipRuntime.js";

const LABELS = Object.freeze({
  trainer: "Train abilities", vendor: "Browse goods", repair: "Repair gear",
  inn: "Rest at inn", hearth: "Make this inn your home", bank: "Open storehouse",
  mailbox: "Open mailbox", profession: "Learn profession", guard: "Ask about danger",
  quest: "Available shlichus"
});

function serviceLabel(service) { return LABELS[service] || service; }
function serviceId(npc, service) { return npc[`${service}Id`] || npc.vendorId || npc.trainerId || npc.innId || npc.id; }
function scopeOf(olam) { return olam || globalThis; }

export function questMarkerForNpc(olam, npcId) {
  const npc = npcById(npcId);
  if (!npc) return "none";
  const key = `marker:${npcSocialHash(olam, npc)}`;
  return memoBySocialHash(scopeOf(olam), key, () => {
    if (completeQuestsForNpc(olam, npc.name).length) return "quest-complete";
    if (availableQuestsForNpc(olam, npc.name).length) return "quest-available";
    const state = ensureMissionState(olam);
    return (npc.quests || []).some(id => state.active[id]) ? "quest-progress" : "none";
  });
}

export function serviceChoicesForNpc(olam, npcId) {
  const npc = npcById(npcId);
  if (!npc) return [];
  const key = `choices:${npcSocialHash(olam, npc)}`;
  return memoBySocialHash(scopeOf(olam), key, () => {
    const choices = [];
    for (const q of completeQuestsForNpc(olam, npc.name)) choices.push({ id:`turnin:${q.id}`, kind:"questTurnIn", label:`Complete: ${q.title}`, missionId:q.id });
    for (const q of availableQuestsForNpc(olam, npc.name)) choices.push({ id:`accept:${q.id}`, kind:"questAccept", label:`Accept: ${q.title}`, missionId:q.id });
    for (const service of npc.services || []) if (service !== "quest") choices.push({ id:`${service}:${serviceId(npc, service)}`, kind:service, label:serviceLabel(service), service });
    return Object.freeze(choices);
  });
}

export function gossipPayload(olam, npcId, options = {}) {
  const npc = npcById(npcId);
  if (!npc) return { open:false, ok:false, reason:"missing-npc", npcId };
  const key = `payload:${npcSocialHash(olam, npc)}`;
  const payload = memoBySocialHash(scopeOf(olam), key, () => Object.freeze({
    open:true, ok:true, npcId:npc.id, npcName:npc.name, greeting:npc.greeting,
    marker:questMarkerForNpc(olam, npc.id), choices:serviceChoicesForNpc(olam, npc.id), socialHash:key
  }));
  if (options.emit) olam?.ayshPeula?.("ui event", "npcGossip", payload);
  return payload;
}

export function clearNpcSocialCache(olam) {
  const scope = scopeOf(olam);
  if (scope.__npcSocialHashCache) scope.__npcSocialHashCache.clear();
}

export default { gossipPayload, questMarkerForNpc, serviceChoicesForNpc, clearNpcSocialCache };
