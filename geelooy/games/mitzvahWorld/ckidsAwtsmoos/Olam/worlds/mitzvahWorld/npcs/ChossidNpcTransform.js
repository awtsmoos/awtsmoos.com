// B"H
/**
 * @file ChossidNpcTransform.js
 * @description Applies identity, transform, inventory, equipment, style, dialogue hooks, and nearly-free NPC motion.
 */
import { createChossidNpcInventory } from "./ChossidNpcInventory.js";
import { applyChossidNpcStyle } from "./ChossidNpcStyle.js";
import { attachChossidNpcAnimator } from "./ChossidNpcAnimator.js?v=awtsmoos-npc-animator-lightning-20260701-bh1";
import { applyNpcVisualLod } from "../../../../systems/npc/NpcVisualLod.js?v=deferred-npc-glb-20260705-bh1";
import { attachQuestMarker } from "../../../../systems/quests/QuestMarkers.js";
import { handleQuestTalk, questDialoguePayload } from "../../../../systems/quests/QuestDialogueRuntime.js";
function vec3(value, fallback) { return Array.isArray(value) ? value : fallback; }
function valueAt(list, index, fallback) { return list[index] !== undefined ? list[index] : fallback; }
function scalarOrArrayScale(npc, scale) { if (Array.isArray(scale)) npc.scale.set(valueAt(scale,0,1), valueAt(scale,1,1), valueAt(scale,2,1)); else npc.scale.setScalar(scale || 1); }
function showWorldText(olam, text, color = "#ffffff") { if (olam && typeof olam.ayshPeula === "function") { olam.ayshPeula("ui event", "effectsOverlay", { text, color }); return; } if (typeof window !== "undefined") console.log(`B"H | NPC_UI | ${text}`); }
function defaultDialogues(displayName) { return [`B"H! I am ${displayName}.`, "The Emerald Void should never be lonely.", "Every mitzvah reveals another spark of the Awtsmoos.", "Press onward, Chossid. There is a whole village to uplift."]; }
function friendlyNpcList(olam) { return (olam?.interactableNivrayim || []).filter(n => ["customNpc", "medabeir", "interactiveNpc"].includes(n?.type)); }
function publishNpcDiag(bridge, patch = {}) {
  const olam = bridge?.olam;
  if (!olam) return null;
  const list = friendlyNpcList(olam);
  olam.__mitzvahNpcDiag = {
    ...(olam.__mitzvahNpcDiag || {}),
    at:Date.now(),
    friendlyCount:list.length,
    targetableCount:list.filter(n => n?.interactable && (n?.raycastMesh || n?.interactionMesh || n?.mesh)).length,
    selected:olam.__selectedFriendlyNpc?.name || null,
    selectedFresh:olam.__selectedFriendlyNpc === bridge && Date.now() - Number(bridge.__targetedAt || 0) < 15000,
    ...patch
  };
  globalThis.__MITZVAH_NPC_DIAG__ = () => olam.__mitzvahNpcDiag;
  return olam.__mitzvahNpcDiag;
}
function selectedAgain(bridge) { const now = Date.now(), olam = bridge.olam; if (!olam) return true; if (olam.__selectedFriendlyNpc !== bridge || now - (bridge.__targetedAt || 0) > 15000) { olam.__selectedFriendlyNpc = bridge; bridge.__targetedAt = now; publishNpcDiag(bridge, { lastClickedNpc:bridge.name, lastAction:"target", lastDialogueEvent:null }); showWorldText(olam, `Targeted ${bridge.name}. Click again to talk.`, "#8de8ff"); return false; } publishNpcDiag(bridge, { lastClickedNpc:bridge.name, lastAction:"talk-ready" }); return true; }
function createNpcNivraBridge(npc, def, inventory) {
  const displayName = def.displayName || def.id || "Chossid", dialogueLines = def.dialogues || defaultDialogues(displayName);
  return { type:"interactiveNpc", name:displayName, role:def.role || "friend", definition:def, questId:def.questId || null, mesh:npc, raycastMesh:npc, interactionMesh:npc, interactable:true, selectableTarget:true, dialogueTarget:true, friendlyNpc:true, npc:true, proximity:def.proximity || 7, talkDistance:def.proximity || 7, dialogue:true, dialogues:dialogueLines, state:"idle", hp:def.hp || 100, maxHp:def.hp || 100, faction:def.faction || "chossidim", isFriendly:def.isFriendly !== false, isReady:true, heesHawveh:true, __npcLowCost:true, __awtsmoosSimplePrecomputedNpc:true, inventory, equipped:inventory.equipped, shop:def.shop || null, quests:def.quests || [],
    takeDamage(amount = 0) { const damage = Math.max(0, Number(amount) || 0); this.hp = Math.max(0, this.hp - damage); npc.userData.hp = this.hp; showWorldText(this.olam, `${this.name}: ${Math.ceil(this.hp)}/${this.maxHp}`, "#ffcc66"); if (this.hp <= 0) { this.wasSealayked = true; npc.visible = false; showWorldText(this.olam, `${this.name} has been subdued`, "#ff6666"); } },
    heal(amount = 10) { this.hp = Math.min(this.maxHp, this.hp + Math.max(0, Number(amount) || 0)); npc.userData.hp = this.hp; },
	    ayshPeula(action, chossid) { if (action === "mouseEnter") { npc.userData.isHovered = true; applyNpcVisualLod(this, this.olam); attachQuestMarker(npc, this, this.olam); publishNpcDiag(this, { lastClickedNpc:this.name, lastAction:"hover" }); return true; } if (action === "mouseLeave") { npc.userData.isHovered = false; return true; } if (action === "accepted interaction") { applyNpcVisualLod(this, this.olam); attachQuestMarker(npc, this, this.olam); if (!selectedAgain(this)) return true; this.state = "talking"; const questPayload = questDialoguePayload(this.olam, this), handledQuest = handleQuestTalk(this.olam, this); attachQuestMarker(npc, this, this.olam); const firstLine = handledQuest?.line || questPayload?.line || this.dialogues[0] || `B"H! ${this.name} is here.`; publishNpcDiag(this, { lastClickedNpc:this.name, lastAction:"talk", lastDialogueEvent:"openNpcChallengeOverlay", questNpc:Boolean(this.questId), questPayload:handledQuest || questPayload, lastDialoguePayload:{ name:this.name, line:firstLine, source:"chossid-glb-npc" } }); showWorldText(this.olam, `${this.name}: ${firstLine}`, "#9fffe0"); this.olam?.ayshPeula?.("ui event", "openNpcChallengeOverlay", { name:this.name, npcName:this.name, lines:[firstLine, ...this.dialogues], quest:handledQuest || questPayload, source:"chossid-glb-npc" }); if (chossid) { chossid.nivraTalkingTo = this; chossid.state = "talking"; } return true; } return false; }
  };
}
function ensureNpcData(npc, def, bridge, inventory) { if (!npc.userData) npc.userData = {}; Object.assign(npc.userData, { mitzvahWorldNpcRoot:true, isNpc:true, npc:true, friendly:true, friendlyNpc:true, selectableTarget:true, dialogueTarget:true, skipRaycast:false, isLiving:true, lowCostNpc:true, awtsmoosSimplePrecomputedNpc:true, skipOctree:true, noOctree:true, nefeshType:"chossidNpc", nefeshId:npc.name, displayName:def.displayName || npc.name, targetName:bridge.name, questId:bridge.questId, markerType:bridge.questId ? "quest" : "dialogue", interactable:true, combatant:false, hp:bridge.hp, maxHp:bridge.maxHp, faction:bridge.faction, inventory }); }
function markChild(child, npc, bridge, inventory) { if (!child) return; if (!child.userData) child.userData = {}; child.nivraAwtsmoos = bridge; Object.assign(child.userData, { ownerNpc:npc.name, interactable:true, isNpcPart:true, isLiving:true, npc:true, friendlyNpc:true, selectableTarget:true, dialogueTarget:true, skipRaycast:false, lowCostNpc:true, skipOctree:true, noOctree:true, inventory }); if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; child.frustumCulled = true; } }
export function applyChossidNpcTransform(npc, def, olam = null, animations = []) {
  const position = vec3(def.position, [0,0,0]), rotation = vec3(def.rotation, [0,0,0]), scale = def.scale !== undefined ? def.scale : 1, inventory = createChossidNpcInventory(def);
  npc.name = def.id || "npc_chossid"; npc.position.set(valueAt(position,0,0), valueAt(position,1,0), valueAt(position,2,0)); npc.rotation.set(valueAt(rotation,0,0), valueAt(rotation,1,0), valueAt(rotation,2,0)); scalarOrArrayScale(npc, scale);
  const bridge = createNpcNivraBridge(npc, def, inventory); bridge.olam = olam; attachChossidNpcAnimator(npc, animations, bridge);
  npc.nivraAwtsmoos = bridge; ensureNpcData(npc, def, bridge, inventory); applyChossidNpcStyle(npc, def); npc.traverse(child => markChild(child, npc, bridge, inventory)); applyNpcVisualLod(bridge, olam, true); attachQuestMarker(npc, bridge, olam);
  if (olam && Array.isArray(olam.nivrayim) && !olam.nivrayim.includes(bridge)) olam.nivrayim.push(bridge);
  if (olam) {
    if (!Array.isArray(olam.interactableNivrayim)) olam.interactableNivrayim = [];
    if (!olam.interactableNivrayim.includes(bridge)) olam.interactableNivrayim.push(bridge);
    publishNpcDiag(bridge, { lastAction:"registered" });
  }
  return npc;
}
