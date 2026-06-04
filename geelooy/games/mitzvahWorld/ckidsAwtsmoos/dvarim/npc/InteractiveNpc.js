// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 4: The guide receives a pillar of gold.
 *
 * The Awtsmoos does not leave a child searching an empty village. This module
 * keeps the existing shop and level overlay contract, but now the guide can be
 * seen from spawn through a cheap mobile-safe beacon, a wider invisible talk
 * box, and a clear payload that opens the level selector.
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
const cleanHex = value => typeof value === "number" ? value : Number.parseInt(String(value || "ffd54a").replace("#", ""), 16);

function sealVisual(root, nivra) {
  root?.traverse?.(child => {
    child.nivraAwtsmoos = nivra;
    child.userData ||= {};
    if (child.userData.awtsmoosRayProxy) return Object.assign(child.userData, { skipRaycast: false, skipOctree: true, noOctree: true });
    Object.assign(child.userData, { skipRaycast: true, skipOctree: true, noOctree: true, isNpcVisual: true });
  });
}
function enrichedSlots(player) { const inv = player?.inventory; return (inv?.slots || []).map(s => s && inv?.enrichItemData ? inv.enrichItemData(s) : s).filter(Boolean); }
function enrichedShop(player, items) { const inv = player?.inventory; return (items || []).map(s => inv?.enrichItemData ? inv.enrichItemData(s) : s); }
function beaconBlueprint(color, height) {
  return { type: "Group", children: [
    { type: "Mesh", geometry: { type: "CylinderGeometry", args: [0.06, 0.06, height, 10] }, material: { type: "MeshBasicMaterial", args: [{ color, transparent: true, opacity: 0.62 }] }, position: [0, height / 2, 0] },
    { type: "Mesh", geometry: { type: "TorusGeometry", args: [0.72, 0.045, 8, 28] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, 2.1, 0] },
    { type: "Mesh", geometry: { type: "SphereGeometry", args: [0.18, 14, 10] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, height + 0.08, 0] }
  ] };
}

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc";
  static itemName = "Village Guide";
  static description = "A grounded dancing guide with levels, market, and visible beacon.";
  constructor(op = {}, olam) {
    const clean = { ...op, dialogue: null, dialogues: null, messageTree: null };
    clean.proximity ||= 4.2; clean.talkDistance ||= clean.proximity; clean.interactable = true; clean.heesHawveh = true;
    clean.visualHeight ||= 1.5; clean.height ||= 1.5; clean.radius ||= 0.42; clean.path ||= "https://models-3122d.web.app/chossid.glb?k=2";
    clean.chaweeyoosMap ||= { idle: "dance silly", run: "dance silly", walk: "dance silly" }; clean.visualGroundBiasY ??= -0.5;
    super(clean, olam);
    this.options = op; this.dialogues = op.dialogues || op.dialogue || DEFAULT_DIALOGUES; this.shopInventory = op.shopInventory || DEFAULT_SHOP;
    this.interactKey = "C"; this.height = clean.visualHeight; this.talkDistance = num(op.talkDistance ?? clean.talkDistance, 4.2);
    this.isDancing = true; this._lastTooFarAt = 0; this._lookTarget = null; this._makeRayProxy(); this._setupEventHandlers();
  }
  _makeRayProxy() {
    const radius = Math.max(1.8, this.talkDistance * 0.72);
    this.interactionMesh = new THREE.Mesh(new THREE.BoxGeometry(radius, 2.7, radius), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    this.interactionMesh.name = "NPC_Guide_Click_Box_Close_Range";
    Object.assign(this.interactionMesh.userData, { awtsmoosRayProxy: true, skipRaycast: false, skipOctree: true, noOctree: true });
    this.interactionMesh.nivraAwtsmoos = this; this.raycastMesh = this.interactionMesh;
  }
  async heescheel(olam) {
    await super.heescheel(olam); if (!this.mesh) this.mesh = new THREE.Object3D();
    Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, awtsmoosVillageGuide: true });
    this.mesh.nivraAwtsmoos = this; sealVisual(this.mesh, this); if (typeof this.randomizeAppearance === "function") this.randomizeAppearance();
    this.interactionMesh.position.set(0, this.height * 0.58, 0); this.mesh.add(this.interactionMesh); this._addMissionMark(); this._addBeacon();
    if (this.olam.interactableNivrayim && !this.olam.interactableNivrayim.includes(this)) this.olam.interactableNivrayim.push(this); this.isReady = true;
  }
  async ready() { await super.ready(); sealVisual(this.modelMesh || this.mesh, this); this.playGuideDance(); }
  _addMissionMark() {
    const color = cleanHex(this.options.beaconColor || 0xffd54a);
    const markBlueprint = { type: "Group", children: [{ type: "Mesh", geometry: { type: "CylinderGeometry", args: [0.045, 0.045, 0.3, 8] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, this.height + 0.3, 0] }, { type: "Mesh", geometry: { type: "SphereGeometry", args: [0.08, 8, 8] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, this.height + 0.08, 0] }] };
    this.missionMark = AwtsmoosThreeManifestor.emanate(markBlueprint); sealVisual(this.missionMark, this); this.mesh.add(this.missionMark);
  }
  _addBeacon() { if (!this.options.beacon) return; this.beaconMesh = AwtsmoosThreeManifestor.emanate(beaconBlueprint(cleanHex(this.options.beaconColor), num(this.options.beaconHeight, 5.5))); sealVisual(this.beaconMesh, this); this.mesh.add(this.beaconMesh); }
  _setupEventHandlers() { this.on("accepted interaction", chossid => this.openGuideMenu(chossid)); this.on("mouseEnter", () => this.olam.ayshPeula("ui event", "tooltip", { show: true, text: "Talk nearby: levels / shop" })); this.on("mouseLeave", () => this.olam.ayshPeula("ui event", "tooltip", { show: false })); this.on("pointerdown", chossid => this.openGuideMenu(chossid)); }
  ayshPeula(peula, actor) { if (peula === "accepted interaction" || peula === "pointerdown") return this.openGuideMenu(actor); return super.ayshPeula?.(peula, actor); }
  findTalker(actor) { return posOf(actor) ? actor : this.olam?.chossid || this.olam?.player || null; }
  distanceTo(actor) { const a = posOf(actor), b = posOf(this); if (!a || !b) return Infinity; const dx = a.x - b.x, dz = a.z - b.z, dy = (a.y || 0) - (b.y || 0); return Math.sqrt(dx * dx + dz * dz + dy * dy * 0.12); }
  sayTooFar() { const now = Date.now(); if (now - this._lastTooFarAt < 800) return; this._lastTooFarAt = now; this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Come closer to the glowing guide.", color: "#ffd54a", replace: true }); }
  faceTalker(actor) { const a = posOf(actor), b = posOf(this); if (!a || !b || !this.mesh) return; const dx = a.x - b.x, dz = a.z - b.z; if (Math.abs(dx) + Math.abs(dz) < 0.001) return; this.mesh.rotation.y = Math.atan2(dx, dz); this._lookTarget = actor; }
  payload(player) { return { fromNpc: this.name, title: "Village Guide", selectorTitle: this.options.selectorTitle || "NPC CHALLENGES", lines: this.dialogues, actions: ["levels", "buy", "sell"], shopInventory: enrichedShop(player, this.shopInventory), items: enrichedShop(player, this.shopInventory), playerInventory: enrichedSlots(player), entityId: this.id || this.name, npcName: this.name || "Village Guide" }; }
  openGuideMenu(actor) { const talker = this.findTalker(actor); if (this.distanceTo(talker) > this.talkDistance) { this.sayTooFar(); return false; } this.faceTalker(talker); this.olam.ayshPeula("ui event", "openNpcChallengeOverlay", this.payload(talker)); return true; }
  playGuideDance() { if (!this.playChaweeyoos || !this.animations?.length) return; this.playChaweeyoos("dance silly"); this.__awtsDanceStarted = true; }
  heesHawvoos(dt) { super.heesHawvoos(dt); if (!this.__awtsDanceStarted && this.animationMixer && this.animations?.length) this.playGuideDance(); if (this._lookTarget && this.distanceTo(this._lookTarget) <= this.talkDistance + 0.8) this.faceTalker(this._lookTarget); if (this.missionMark) { this.missionMark.rotation.y += dt * 2; this.missionMark.position.y = this.height + 0.28 + Math.sin(Date.now() * 0.005) * 0.04; } if (this.beaconMesh) this.beaconMesh.rotation.y += dt * 0.7; }
}
