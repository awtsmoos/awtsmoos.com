// B"H
/** NPC interactions keep click menus open and feed memory, gossip, quests, and services. */
import { gossipPayload } from "./GossipRuntime.js";
import { npcServices } from "./NpcServiceRegistry.js";
import { createNpcMemoryRuntime } from "./NpcMemoryRuntime.js";

function allNpcs(olam) {
  return [olam?.npcs, olam?.nivrayim, olam?.interactables].flat().filter(Boolean).filter(n => n.interactable || n.options?.interactable || n.mesh?.userData?.npcId || /npc|rebbe|baker|guard|merchant|villager/i.test(String(n.name || n.id || "")));
}

function emit(scope, name, payload) {
  scope.__MITZVAH_UI_BRIDGE__?.receive?.(name, payload);
  try { scope.dispatchEvent?.(new CustomEvent(`mitzvah-world:${name}`, { detail:payload })); } catch {}
}

function findNpc(npcs, id) {
  const wanted = String(id || "");
  return npcs.find(n => [n.id, n.npcId, n.name, n.mesh?.name, n.mesh?.userData?.npcId].filter(Boolean).map(String).includes(wanted)) || npcs[0] || { id:wanted || "villager", name:"Villager" };
}

export function npcInteractionIndex(npcs = null) {
  const list = Array.isArray(npcs) && npcs.length ? npcs : npcServices();
  return { npcs:list, byId:Object.fromEntries(list.map(n => [n.id || n.npcId, n])) };
}

export function createNpcInteractionRuntime(npcs = [], scope = globalThis) {
  return {
    open(id, ctx = {}) {
      const npc = findNpc(npcs, id);
      const payload = gossipPayload(npc, ctx);
      emit(scope, "npcGossip", payload);
      return payload;
    },
    choose(id, choice) {
      const npc = findNpc(npcs, id);
      const payload = gossipPayload(npc, { choice });
      payload.greeting = choice === "vendor" ? "Here is what I can sell and buy." : choice === "train" ? "Choose a skill and grow stronger." : choice === "quest" ? "A shlichus is waiting for you." : payload.greeting;
      emit(scope, "npcGossip", payload);
      return payload;
    },
    nearest() {
      return npcs[0] || null;
    }
  };
}

export function installNpcInteractionControls(scope = globalThis, olamGetter = () => scope.__AWTSMOOS_OLAM__ || scope.olam) {
  if (scope.__MITZVAH_NPC_INTERACTION__?.open) return scope.__MITZVAH_NPC_INTERACTION__;
  const runtime = {
    open(id, ctx = {}) { return createNpcInteractionRuntime(allNpcs(olamGetter()), scope).open(id, ctx); },
    choose(id, choice) { return createNpcInteractionRuntime(allNpcs(olamGetter()), scope).choose(id, choice); },
    nearest() { return createNpcInteractionRuntime(allNpcs(olamGetter()), scope).nearest(); }
  };
  scope.__MITZVAH_NPC_INTERACTION__ = runtime;
  return runtime;
}

export function openNpcInteraction(olamOrNpcId = {}, idOrContext = "rebbe", npcs = []) {
  const legacyOlam = typeof olamOrNpcId === "object" && (olamOrNpcId.ayshPeula || olamOrNpcId.player || olamOrNpcId.chossid || olamOrNpcId.npcs);
  const olam = legacyOlam ? olamOrNpcId : {};
  const npcId = legacyOlam ? idOrContext : olamOrNpcId;
  const context = legacyOlam ? {} : (idOrContext || {});
  const store = context.store || globalThis.__MITZVAH_WORLD_STATE__ || {};
  const memory = createNpcMemoryRuntime(store);
  const npc = findNpc([...allNpcs(olam), ...npcs, ...npcServices()], npcId);
  memory.remember(npc.id || npcId, { kind:"player_spoke", text:"The player stopped to speak.", place:context.place || npc.currentPlace });
  const effects = memory.effects(npc.id || npcId);
  const base = gossipPayload(npc, { ...context, store });
  const payload = { ok:true, ...base, name:npc.name, memoryEffects:effects, serviceHint:npc.workplace, questBias:effects.questBias };
  olam.__activeNpcInteraction = payload;
  olam.ayshPeula?.("ui event", "npcGossip", payload);
  emit(globalThis, "starter-signal", { signal:"npc", evidence:payload });
  return payload;
}

export function performTalk(olamOrNpcId = {}, idOrText = "", npcs = []) {
  const legacyOlam = typeof olamOrNpcId === "object" && (olamOrNpcId.ayshPeula || olamOrNpcId.player || olamOrNpcId.chossid || olamOrNpcId.npcs);
  if (legacyOlam) {
    const payload = openNpcInteraction(olamOrNpcId, idOrText || "villager", npcs);
    return { ok:true, npc:{ id:payload.npcId, name:payload.npcName }, payload };
  }
  return openNpcInteraction(olamOrNpcId || "villager", typeof idOrText === "string" ? { text:idOrText } : idOrText, npcs);
}

export default createNpcInteractionRuntime;
