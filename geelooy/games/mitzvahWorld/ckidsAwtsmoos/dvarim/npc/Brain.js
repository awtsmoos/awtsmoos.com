// B"H
/**
 * @file Brain.js
 * @description
 * Chapter 635: The NPC mind no longer only sells and speaks. It offers story,
 * shlichus, Torah teaching, old quest compatibility, and shop access from one
 * clean dialogue tree, without breaking the previous handler.
 */
import { QUEST_STATE } from "../../systems/quests/Shlichus.js";
import { npcStoryResponses } from "../../systems/npc/NpcStoryRuntime.js";
import { npcMissionResponses, npcTorahTeachingResponses, emitNpcMissionPayload } from "../../systems/npc/NpcMissionRuntime.js";
function cloneTree(tree) { return JSON.parse(JSON.stringify(tree || [])); }
function olamOf(npc) { return npc?.olam || null; }
function baseTree(customData = {}) { const tree = customData.dialogueTree; return Array.isArray(tree) && tree.length ? cloneTree(tree) : [{ message: "B\"H\nShalom! How can I help you?", responses: [] }]; }
function oldQuestTree(npc, shopInventory) {
  const handler = npc.olam ? npc.olam.shlichusHandler : null; if (!handler) return null;
  const turnIns = Array.from(handler.activeQuests.values()).filter(q => q.returnToId === npc.id && q.state === QUEST_STATE.READY_TO_TURN_IN);
  if (turnIns.length) { const q = turnIns[0]; return [{ message: "B\"H\nExcellent work on: " + q.title, responses: [{ text: "Here is what I found/did.", action: me => { q.complete(); me.updateOverheadIcon?.(); } }] }]; }
  const available = Array.from(handler.activeQuests.values()).filter(q => q.giverId === npc.id && q.state === QUEST_STATE.AVAILABLE);
  if (available.length) { const q = available[0]; return [{ message: "B\"H\n" + (q.description || "I have a mitzvah opportunity for you."), responses: [{ text: "I accept this mission (" + q.title + ")", action: me => { handler.acceptQuest(q.id); me.updateOverheadIcon?.(); } }, { text: "Maybe later.", type: "close" }] }]; }
  const waiting = Array.from(handler.activeQuests.values()).filter(q => q.returnToId === npc.id && q.state === QUEST_STATE.ACTIVE);
  if (waiting.length) { const responses = [{ text: "I'm on it.", type: "close" }]; if (shopInventory?.length) responses.push({ text: "Can I browse your shop meanwhile?", action: me => NpcBrain.openShop(me, shopInventory) }); return [{ message: "Hatzlacha! I am waiting for you to complete: " + waiting[0].title, responses }]; }
  return null;
}
function appendRuntimeResponses(npc, tree, shopInventory) {
  const root = tree[0] || { message: "B\"H", responses: [] }; root.responses ||= [];
  const olam = olamOf(npc); emitNpcMissionPayload(npc, olam);
  root.responses.push(...npcStoryResponses(npc, olam).slice(0, 1));
  root.responses.push(...npcMissionResponses(npc, olam));
  root.responses.push(...npcTorahTeachingResponses(npc, olam));
  if (shopInventory?.length && !root.responses.some(r => /shop|wares/i.test(r.text || ""))) root.responses.push({ text: "I'd like to browse your wares.", action: me => NpcBrain.openShop(me, shopInventory) });
  if (!root.responses.length) root.responses.push({ text: "Goodbye.", type: "close" });
  return tree;
}
export default class NpcBrain {
  static getMessageTree(npc, customData = {}, shopInventory = []) { return appendRuntimeResponses(npc, oldQuestTree(npc, shopInventory) || baseTree(customData), shopInventory); }
  static openShop(me, shopInventory) {
    if (!me.olam?.player?.inventory) return;
    const inv = me.olam.player.inventory;
    const enrichedPlayerItems = (inv.slots || []).map(s => s ? inv.enrichItemData?.(s) || s : null);
    const enrichedShopItems = (shopInventory || []).map(s => inv.enrichItemData?.(s) || s);
    me.olam.ayshPeula("ui event", "storeScreen", { open: { entityId: me.id, npcName: me.name, items: enrichedShopItems, playerInventory: enrichedPlayerItems } });
    me.ayshPeula?.("close dialogue", "Let me know if you need anything.");
  }
}
