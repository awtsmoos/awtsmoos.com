// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 210: The guide speaks only across real nearness.
 *
 * The Awtsmoos does not let a faraway tap tear open a menu from across the
 * village. The NPC now checks distance on every talk attempt, faces the chossid
 * while speaking, and keeps the invisible ray proxy clickable without letting
 * the visual body enter the octree.
 */
import Medabeir from "../../chayim/medabeir/index.js?v=no-auto-dialogue-20260602-bh9";
import * as THREE from "/games/scripts/build/three.module.js";
import AwtsmoosThreeManifestor from "../../utils/3d/procedural/AwtsmoosThreeManifestor.js";

const DEFAULT_DIALOGUES = ["Shalom! Choose levels, buy clothes, or sell extras.", "Your bag buys colored clothing.", "Give tzedakah in a level and the mezuzah returns double."];
const DEFAULT_SHOP = [
  { id: "blue_shirt", name: "Blue Shirt", icon: "👕", equipSlot: "shirt", price: 3, sellValue: 1, customData: { meshName: ["shirt", "outer-shirt"], color: "#4db8ff" } },
  { id: "gold_shirt", name: "Gold Shirt", icon: "👕", equipSlot: "shirt", price: 5, sellValue: 2, customData: { meshName: ["shirt", "outer-shirt"], color: "#ffd54a" } },
  { id: "green_coat", name: "Green Coat", icon: "🧥", equipSlot: "jacket", price: 6, sellValue: 3, customData: { meshName: "jacket", color: "#2ecc71" } },
  { id: "purple_coat", name: "Purple Coat", icon: "🧥", equipSlot: "jacket", price: 6, sellValue: 3, customData: { meshName: "jacket", color: "#9b5cff" } },
  { id: "brown_shoes", name: "Brown Shoes", icon: "👞", equipSlot: "feet", price: 4, sellValue: 2, customData: { meshName: "shoes", color: "#8b5a2b" } }
];
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const posOf = nivra => nivra?.mesh?.position || nivra?.modelMesh?.position || nivra?.guf?.position || null;

function sealVisual(root, nivra) {
  root?.traverse?.(child => {
    child.nivraAwtsmoos = nivra;
    child.userData ||= {};
    if (child.userData.awtsmoosRayProxy) {
      Object.assign(child.userData, { skipRaycast: false, skipOctree: true, noOctree: true });
      return;
    }
    Object.assign(child.userData, { skipRaycast: true, skipOctree: true, noOctree: true, isNpcVisual: true });
  });
}

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc";
  static itemName = "Village Guide";
  static description = "A grounded dancing guide with levels and a clothing market.";

  constructor(op = {}, olam) {
    const clean = { ...op, dialogue: null, dialogues: null, messageTree: null };
    clean.proximity ||= 4.2;
    clean.talkDistance ||= clean.proximity;
    clean.interactable = true;
    clean.heesHawveh = true;
    clean.visualHeight ||= 1.5;
    clean.height ||= 1.5;
    clean.radius ||= 0.42;
    clean.path ||= "https://models-3122d.web.app/chossid.glb?k=2";
    clean.chaweeyoosMap ||= { idle: "dance silly", run: "dance silly", walk: "dance silly" };
    clean.visualGroundBiasY ??= 0;
    super(clean, olam);
    this.options = op;
    this.dialogues = op.dialogues || op.dialogue || DEFAULT_DIALOGUES;
    this.shopInventory = op.shopInventory || DEFAULT_SHOP;
    this.interactKey = "C";
    this.height = clean.visualHeight;
    this.talkDistance = num(op.talkDistance ?? clean.talkDistance, 4.2);
    this.isDancing = true;
    this._lastTooFarAt = 0;
    this._lookTarget = null;
    this._makeRayProxy();
    this._setupEventHandlers();
  }

  _makeRayProxy() {
    const radius = Math.max(1.8, this.talkDistance * 0.72);
    this.interactionMesh = new THREE.Mesh(new THREE.BoxGeometry(radius, 2.5, radius), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    this.interactionMesh.name = "NPC_Guide_Click_Box_Close_Range";
    Object.assign(this.interactionMesh.userData, { awtsmoosRayProxy: true, skipRaycast: false, skipOctree: true, noOctree: true });
    this.interactionMesh.nivraAwtsmoos = this;
    this.raycastMesh = this.interactionMesh;
  }

  async heescheel(olam) {
    await super.heescheel(olam);
    if (!this.mesh) this.mesh = new THREE.Object3D();
    Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, awtsmoosVillageGuide: true });
    this.mesh.nivraAwtsmoos = this;
    sealVisual(this.mesh, this);
    if (typeof this.randomizeAppearance === "function") this.randomizeAppearance();
    this.interactionMesh.position.set(0, this.height * 0.58, 0);
    this.mesh.add(this.interactionMesh);
    this._addMissionMark(0xffd54a);
    if (this.olam.interactableNivrayim && !this.olam.interactableNivrayim.includes(this)) this.olam.interactableNivrayim.push(this);
    this.isReady = true;
  }

  async ready() {
    await super.ready();
    sealVisual(this.modelMesh || this.mesh, this);
    this.playGuideDance();
  }

  _addMissionMark(color) {
    const markBlueprint = { type: "Group", children: [{ type: "Mesh", geometry: { type: "CylinderGeometry", args: [0.045, 0.045, 0.28, 8] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, this.height + 0.28, 0] }, { type: "Mesh", geometry: { type: "SphereGeometry", args: [0.075, 8, 8] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, this.height + 0.07, 0] }] };
    this.missionMark = AwtsmoosThreeManifestor.emanate(markBlueprint);
    sealVisual(this.missionMark, this);
    this.mesh.add(this.missionMark);
  }

  _setupEventHandlers() {
    this.on("accepted interaction", chossid => this.openGuideMenu(chossid));
    this.on("mouseEnter", () => this.olam.ayshPeula("ui event", "tooltip", { show: true, text: "Talk nearby: levels / shop" }));
    this.on("mouseLeave", () => this.olam.ayshPeula("ui event", "tooltip", { show: false }));
    this.on("pointerdown", chossid => this.openGuideMenu(chossid));
  }

  ayshPeula(peula, actor) {
    if (peula === "accepted interaction" || peula === "pointerdown") return this.openGuideMenu(actor);
    return super.ayshPeula?.(peula, actor);
  }

  findTalker(actor) {
    if (posOf(actor)) return actor;
    return this.olam?.chossid || this.olam?.player || null;
  }

  distanceTo(actor) {
    const a = posOf(actor), b = posOf(this);
    if (!a || !b) return Infinity;
    const dx = a.x - b.x, dz = a.z - b.z, dy = (a.y || 0) - (b.y || 0);
    return Math.sqrt(dx * dx + dz * dz + dy * dy * 0.12);
  }

  sayTooFar() {
    const now = Date.now();
    if (now - this._lastTooFarAt < 800) return;
    this._lastTooFarAt = now;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Come closer to talk.", color: "#ffd54a", replace: true });
  }

  faceTalker(actor) {
    const a = posOf(actor), b = posOf(this);
    if (!a || !b || !this.mesh) return;
    const dx = a.x - b.x, dz = a.z - b.z;
    if (Math.abs(dx) + Math.abs(dz) < 0.001) return;
    this.mesh.rotation.y = Math.atan2(dx, dz);
    this._lookTarget = actor;
  }

  openGuideMenu(actor) {
    const talker = this.findTalker(actor);
    if (this.distanceTo(talker) > this.talkDistance) { this.sayTooFar(); return false; }
    this.faceTalker(talker);
    const payload = { fromNpc: this.name, title: "Village Guide", selectorTitle: this.options.selectorTitle || "NPC CHALLENGES", lines: this.dialogues, actions: ["levels", "buy", "sell"], shopInventory: this.shopInventory, entityId: this.id || this.name, npcName: this.name || "Village Guide" };
    this.olam.ayshPeula("ui event", "openNpcChallengeOverlay", payload);
    return true;
  }

  playGuideDance() {
    if (!this.playChaweeyoos || !this.animations?.length) return;
    this.playChaweeyoos("dance silly");
    this.__awtsDanceStarted = true;
  }

  heesHawvoos(dt) {
    super.heesHawvoos(dt);
    if (!this.__awtsDanceStarted && this.animationMixer && this.animations?.length) this.playGuideDance();
    if (this._lookTarget && this.distanceTo(this._lookTarget) <= this.talkDistance + 0.8) this.faceTalker(this._lookTarget);
    if (this.missionMark) { this.missionMark.rotation.y += dt * 2; this.missionMark.position.y = this.height + 0.28 + Math.sin(Date.now() * 0.005) * 0.04; }
  }
}
