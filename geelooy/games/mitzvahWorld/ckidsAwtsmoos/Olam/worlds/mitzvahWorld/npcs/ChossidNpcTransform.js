// B"H
/**
 * @file ChossidNpcTransform.js
 * @description Applies identity, transform, inventory, equipment, style, dialogue hooks, and living NPC motion.
 */
import { createChossidNpcInventory } from "./ChossidNpcInventory.js";
import { applyChossidNpcStyle } from "./ChossidNpcStyle.js";
import { attachChossidNpcAnimator } from "./ChossidNpcAnimator.js?v=awtsmoos-npc-animator-20260614-bh2";
function vec3(value, fallback) { return Array.isArray(value) ? value : fallback; }
function valueAt(list, index, fallback) { return list[index] !== undefined ? list[index] : fallback; }
function scalarOrArrayScale(npc, scale) { if (Array.isArray(scale)) npc.scale.set(valueAt(scale,0,1), valueAt(scale,1,1), valueAt(scale,2,1)); else npc.scale.setScalar(scale || 1); }
function showWorldText(olam, text, color = "#ffffff") { if (olam && typeof olam.ayshPeula === "function") { olam.ayshPeula("ui event", "effectsOverlay", { text, color }); return; } if (typeof window !== "undefined") console.log(`B"H | NPC_UI | ${text}`); }
function defaultDialogues(displayName) { return [`B"H! I am ${displayName}.`, "The Emerald Void should never be lonely.", "Every mitzvah reveals another spark of the Awtsmoos.", "Press onward, Chossid. There is a whole village to uplift."]; }
function selectedAgain(bridge) { const now = Date.now(); const olam = bridge.olam; if (!olam) return true; if (olam.__selectedFriendlyNpc !== bridge || now - (bridge.__targetedAt || 0) > 2400) { olam.__selectedFriendlyNpc = bridge; bridge.__targetedAt = now; showWorldText(olam, `Targeted ${bridge.name}. Click again to talk.`, "#8de8ff"); return false; } return true; }
function createNpcNivraBridge(npc, def, inventory) {
  const displayName = def.displayName || def.id || "Chossid";
  const dialogueLines = def.dialogues || defaultDialogues(displayName);
  return { type:"interactiveNpc", name:displayName, role:def.role || "friend", mesh:npc, proximity:def.proximity || 7, dialogue:true, dialogues:dialogueLines, state:"idle", hp:def.hp || 100, maxHp:def.hp || 100, faction:def.faction || "chossidim", isFriendly:def.isFriendly !== false, isReady:true, heesHawveh:true, inventory, equipped:inventory.equipped, shop:def.shop || null, quests:def.quests || [],
    takeDamage(amount = 0) { const damage = Math.max(0, Number(amount) || 0); this.hp = Math.max(0, this.hp - damage); npc.userData.hp = this.hp; showWorldText(this.olam, `${this.name}: ${Math.ceil(this.hp)}/${this.maxHp}`, "#ffcc66"); if (this.hp <= 0) { this.wasSealayked = true; npc.visible = false; showWorldText(this.olam, `${this.name} has been subdued`, "#ff6666"); } },
    heal(amount = 10) { this.hp = Math.min(this.maxHp, this.hp + Math.max(0, Number(amount) || 0)); npc.userData.hp = this.hp; },
    ayshPeula(action, chossid) { if (action === "mouseEnter") { npc.userData.isHovered = true; return; } if (action === "mouseLeave") { npc.userData.isHovered = false; return; } if (action === "accepted interaction") { if (!selectedAgain(this)) return; this.state = "talking"; const firstLine = this.dialogues[0] || `B"H! ${this.name} is here.`; showWorldText(this.olam, `${this.name}: ${firstLine}`, "#9fffe0"); if (chossid) { chossid.nivraTalkingTo = this; chossid.state = "talking"; } } }
  };
}
function ensureNpcData(npc, def, bridge, inventory) { if (!npc.userData) npc.userData = {}; Object.assign(npc.userData, { mitzvahWorldNpcRoot:true, isNpc:true, isLiving:true, skipOctree:true, noOctree:true, nefeshType:"chossidNpc", nefeshId:npc.name, displayName:def.displayName || npc.name, interactable:true, combatant:true, hp:bridge.hp, maxHp:bridge.maxHp, faction:bridge.faction, inventory }); }
function markChild(child, npc, bridge, inventory) { if (!child) return; if (!child.userData) child.userData = {}; child.nivraAwtsmoos = bridge; Object.assign(child.userData, { ownerNpc:npc.name, interactable:true, isNpcPart:true, isLiving:true, skipOctree:true, noOctree:true, inventory }); if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; child.frustumCulled = false; } }
export function applyChossidNpcTransform(npc, def, olam = null, animations = []) {
  const position = vec3(def.position, [0,0,0]), rotation = vec3(def.rotation, [0,0,0]), scale = def.scale !== undefined ? def.scale : 1;
  const inventory = createChossidNpcInventory(def);
  npc.name = def.id || "npc_chossid";
  npc.position.set(valueAt(position,0,0), valueAt(position,1,0), valueAt(position,2,0));
  npc.rotation.set(valueAt(rotation,0,0), valueAt(rotation,1,0), valueAt(rotation,2,0));
  scalarOrArrayScale(npc, scale);
  const bridge = createNpcNivraBridge(npc, def, inventory); bridge.olam = olam; attachChossidNpcAnimator(npc, animations, bridge);
  npc.nivraAwtsmoos = bridge; ensureNpcData(npc, def, bridge, inventory); applyChossidNpcStyle(npc, def);
  npc.traverse(child => markChild(child, npc, bridge, inventory));
  if (olam && Array.isArray(olam.nivrayim) && !olam.nivrayim.includes(bridge)) olam.nivrayim.push(bridge);
  return npc;
}
