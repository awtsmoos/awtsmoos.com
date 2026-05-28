/**
 * B\"H
 * @file ChossidNpcTransform.js
 * @description
 * Applies identity, transform, inventory, equipment, style, dialogue hooks,
 * and light combat state to real chossid.glb NPCs.
 */

import { createChossidNpcInventory } from "./ChossidNpcInventory.js";
import { applyChossidNpcStyle } from "./ChossidNpcStyle.js";

function vec3(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function showWorldText(olam, text, color = "#ffffff") {
  if (olam && typeof olam.ayshPeula === "function") {
    olam.ayshPeula("ui event", "effectsOverlay", { text, color });
    return;
  }

  if (typeof window !== "undefined") console.log(`B"H | NPC_UI | ${text}`);
}

function createNpcNivraBridge(npc, def, inventory) {
  const displayName = def.displayName || def.id || "Chossid";
  const dialogueLines = def.dialogues || [
    `B"H! I am ${displayName}.`,
    "The Emerald Void should never be lonely.",
    "Every mitzvah reveals another spark of the Awtsmoos.",
    "Press onward, Chossid. There is a whole village to uplift."
  ];

  return {
    type: "interactiveNpc",
    name: displayName,
    role: def.role || "friend",
    mesh: npc,
    proximity: def.proximity || 7,
    dialogue: true,
    dialogues: dialogueLines,
    state: "idle",
    hp: def.hp || 100,
    maxHp: def.hp || 100,
    faction: def.faction || "chossidim",
    isFriendly: def.isFriendly !== false,
    inventory,
    equipped: inventory.equipped,
    shop: def.shop || null,
    quests: def.quests || [],
    takeDamage(amount = 0) {
      const damage = Math.max(0, Number(amount) || 0);
      this.hp = Math.max(0, this.hp - damage);
      npc.userData.hp = this.hp;
      showWorldText(this.olam, `${this.name}: ${Math.ceil(this.hp)}/${this.maxHp}`, "#ffcc66");

      if (this.hp <= 0) {
        this.wasSealayked = true;
        npc.visible = false;
        showWorldText(this.olam, `${this.name} has been subdued`, "#ff6666");
      }
    },
    heal(amount = 10) {
      this.hp = Math.min(this.maxHp, this.hp + Math.max(0, Number(amount) || 0));
      npc.userData.hp = this.hp;
    },
    ayshPeula(action, chossid) {
      if (action === "mouseEnter") { npc.userData.isHovered = true; return; }
      if (action === "mouseLeave") { npc.userData.isHovered = false; return; }
      if (action === "accepted interaction") {
        this.state = "talking";
        const firstLine = this.dialogues[0] || `B"H! ${this.name} is here.`;
        showWorldText(this.olam, `${this.name}: ${firstLine}`, "#9fffe0");

        if (chossid) {
          chossid.nivraTalkingTo = this;
          chossid.state = "talking";
        }
      }
    }
  };
}

export function applyChossidNpcTransform(npc, def, olam = null) {
  const position = vec3(def.position, [0, 0, 0]);
  const rotation = vec3(def.rotation, [0, 0, 0]);
  const scale = def.scale ?? 1;
  const inventory = createChossidNpcInventory(def);

  npc.name = def.id || "npc_chossid";
  npc.position.set(position[0] ?? 0, position[1] ?? 0, position[2] ?? 0);
  npc.rotation.set(rotation[0] ?? 0, rotation[1] ?? 0, rotation[2] ?? 0);

  if (Array.isArray(scale)) {
    npc.scale.set(scale[0] ?? 1, scale[1] ?? 1, scale[2] ?? 1);
  } else {
    npc.scale.setScalar(scale || 1);
  }

  const nivraBridge = createNpcNivraBridge(npc, def, inventory);
  nivraBridge.olam = olam;

  npc.nivraAwtsmoos = nivraBridge;
  npc.userData.mitzvahWorldNpcRoot = true;
  npc.userData.isNpc = true;
  npc.userData.isLiving = true;
  npc.userData.skipOctree = true;
  npc.userData.noOctree = true;
  npc.userData.nefeshType = "chossidNpc";
  npc.userData.nefeshId = npc.name;
  npc.userData.displayName = def.displayName || npc.name;
  npc.userData.interactable = true;
  npc.userData.combatant = true;
  npc.userData.hp = nivraBridge.hp;
  npc.userData.maxHp = nivraBridge.maxHp;
  npc.userData.faction = nivraBridge.faction;
  npc.userData.inventory = inventory;

  applyChossidNpcStyle(npc, def);

  npc.traverse(child => {
    if (!child) return;
    child.nivraAwtsmoos = nivraBridge;
    child.userData.ownerNpc = npc.name;
    child.userData.interactable = true;
    child.userData.isNpcPart = true;
    child.userData.isLiving = true;
    child.userData.skipOctree = true;
    child.userData.noOctree = true;
    child.userData.inventory = inventory;

    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
    }
  });

  return npc;
}
