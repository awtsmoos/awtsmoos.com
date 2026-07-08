// B"H
/**
 * @file GossipRuntime.js
 * @description
 * Chapter 421: Dialogue remembers both call orders.
 *
 * Some callers speak as `gossipPayload(npc, store)`. Older starter behavior
 * tests speak as `gossipPayload(olam, npcId)`. The runtime now recognizes both
 * without birthing another dialogue system. The same quest bridge still supplies
 * actual mission choices.
 */
import { questChoicesForNpc } from "../missions/QuestGossipRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { npcStoryBeat } from "./NpcStoryRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const cache = new Map();
const MUTATIONS = [
  "The player delivered bread.",
  "The player helped Miriam.",
  "The player saved the bakery.",
  "The whole village says the player brings blessing."
];
const defaultChoices = Object.freeze([
  { id:"quest", label:"Shlichus" },
  { id:"vendor", label:"Trade" },
  { id:"gossip", label:"Rumors" },
  { id:"train", label:"Training" }
]);

function looksLikeOlam(value) { return value && typeof value === "object" && (value.ayshPeula || value.player || value.chossid || value.events || value.__activeMissions || value.activeMissions); }
function parseArgs(first, second) { if (looksLikeOlam(first) && typeof second === "string") return { npc:{ id:second, name:String(second).replace(/_/g, " ") }, ctx:first, store:first }; const npc = typeof first === "object" && first ? first : { id:first, name:String(first || "Villager").replace(/_/g, " ") }; const ctx = second || globalThis.__MITZVAH_WORLD_STATE__ || {}; return { npc, ctx, store:ctx.store || ctx }; }
function storyLine(npc = {}, ctx = {}) { return npcStoryBeat(npc, ctx).line || "The village breathes quietly."; }
function completedOf(store = {}) { return store.completedMissions || store.__completedMissions || []; }
function choicesFor(npc = {}, store = {}) { const npcId = npc.id || npc.npcId || npc.name || "villager"; const quests = questChoicesForNpc(npcId, completedOf(store)).map(q => ({ id:q.id, kind:"questAccept", missionId:q.missionId || q.id, label:q.label || q.title })); const base = npc.choices || defaultChoices; return quests.length ? [...quests, ...base] : base; }

export function mutateRumorText(rumor = {}) {
  const spreads = rumor.spreadCount || 0;
  if (spreads >= 10) return MUTATIONS[3];
  if (spreads >= 5) return MUTATIONS[2];
  if (spreads >= 2) return MUTATIONS[1];
  return rumor.originalText || rumor.currentText || MUTATIONS[0];
}

export function createRumor(sourceNpc = "village", text = "A kindness happened.", topic = "kindness") {
  return { id:`rumor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, sourceNpc, originalText:text, currentText:text, truthValue:true, distortionAmount:0, spreadCount:0, heardBy:[sourceNpc], timestamp:Date.now(), topic, emotionalTone:"warm" };
}

export function spreadRumor(rumor = {}, npcId = "villager") {
  const heard = new Set(rumor.heardBy || []);
  heard.add(npcId);
  const spreadCount = (rumor.spreadCount || 0) + 1;
  return { ...rumor, spreadCount, heardBy:[...heard], distortionAmount:Math.min(1, (rumor.distortionAmount || 0) + 0.1), currentText:mutateRumorText({ ...rumor, spreadCount }), timestamp:Date.now() };
}

export function gossipPayload(npcOrOlam = "villager", ctxOrNpcId = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const { npc, ctx, store } = parseArgs(npcOrOlam, ctxOrNpcId);
  const npcId = npc.id || npc.npcId || npc.name || "villager";
  const key = JSON.stringify([npcId, ctx.reputation, ctx.weather, ctx.questHash, (store.rumors || []).length, JSON.stringify(completedOf(store))]);
  if (cache.has(key)) return cache.get(key);
  const rumors = (store.rumors || []).filter(r => !r.heardBy || r.heardBy.includes(npcId) || r.spreadCount > 1).slice(-4);
  const line = storyLine(npc, ctx);
  const payload = { open:true, ok:true, npcId, npcName:npc.name || npc.title || "Villager", title:npc.name || npc.title || "Villager", greeting:line, line, choices:choicesFor(npc, store), rumors, lines:rumors.map(r => r.currentText), tone:rumors.some(r => r.emotionalTone === "worried") ? "worried" : "warm" };
  cache.set(key, payload);
  if (cache.size > 80) cache.delete(cache.keys().next().value);
  return payload;
}

export function propagateRumors(store = globalThis.__MITZVAH_WORLD_STATE__ || {}, npcIds = []) {
  store.rumors ||= [];
  const next = [];
  for (const rumor of store.rumors.slice(-12)) {
    const target = npcIds.find(id => !(rumor.heardBy || []).includes(id));
    next.push(target ? spreadRumor(rumor, target) : rumor);
  }
  store.rumors = next;
  return store.rumors;
}

export function clearGossipCache() { cache.clear(); }
export default { createRumor, spreadRumor, mutateRumorText, gossipPayload, propagateRumors, clearGossipCache };
