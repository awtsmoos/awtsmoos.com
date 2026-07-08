// B"H
/**
 * @file customNpc.js
 * @description
 * Chapter 636: Custom NPCs now carry schedules, stories, missions, shops, and
 * Torah teaching. The Awtsmoos moves them between waypoints without making them
 * collide with the shliach like a wall.
 */
import Medabeir from "../chayim/medabeir/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Utils from "../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import NpcBrain from "./npc/Brain.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import NpcVisuals from "./npc/Visuals.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import IntenseNpcMesh from "./npc/IntenseNpcMesh.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureNpcSchedule, updateNpcSchedule } from "../systems/npc/NpcScheduleRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class CustomNpc extends Medabeir {
  type = "customNpc"; static itemName = "Custom NPC"; static description = "A custom designed character."; static isBuildable = true;
  constructor(op = {}, olam) {
    const customData = op.itemData?.customData || op.customData || {};
    op.name = customData.name || op.name || "Anonymous Soul"; op.placeholderName = op.name; op.isSolid = false; op.interactable = true;
    op.path = customData.modelPath || op.path || "https://models-3122d.web.app/chossid.glb"; op.heesHawveh = true; if (op.proximity === undefined) op.proximity = 3.5;
    super(op, olam); if (olam) this.olam = olam; if (!this.id) this.id = op.id || Utils.generateID();
    this.customData = customData; this.quests = customData.quests || []; this.shopInventory = customData.shopInventory || []; this.balance = customData.balance || 0; this.iconState = null;
    this.shopInventory.forEach(item => { if (!item.className) item.className = "Brick"; if (!item.icon) item.icon = ""; });
    ensureNpcSchedule(this, customData.schedule || {});
    this.on("ready", () => { this.registerMyQuests(); this.updateOverheadIcon(); if (this.customData?.clothes && typeof this.updateAppearance === "function") this.updateAppearance(); else if (typeof this.randomizeAppearance === "function") this.randomizeAppearance(); });
    this.messageTree = () => NpcBrain.getMessageTree(this, this.customData, this.shopInventory);
  }
  async heescheel(olam) {
    if (this.path === "procedural") {
      this.olam = olam; const color = this.customData.color || "#ff00ea";
      this.mesh = IntenseNpcMesh.build(color); this.mesh.name = this.name; this.mesh.nivraAwtsmoos = this;
      if (this.position) this.mesh.position.copy(this.position.vector3()); if (this.rotation) this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
      this.mesh.traverse(c => { if (c.isMesh) { c.userData.visualReference = this.mesh; c.nivraAwtsmoos = this; } });
      await olam.hoyseef(this); this.isReady = true;
    } else await super.heescheel(olam);
    ensureNpcSchedule(this, this.customData.schedule || {});
  }
  heesHawvoos(dt) { super.heesHawvoos?.(dt); updateNpcSchedule(this, this.olam, dt); }
  registerMyQuests() { if (this.olam?.shlichusHandler && this.quests.length > 0) this.quests.forEach(q => this.olam.shlichusHandler.registerQuest(this, q)); }
  updateOverheadIcon() { NpcVisuals.updateOverheadIcon(this); }
}
