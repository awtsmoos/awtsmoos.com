// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 84: The guide may no longer hide in the grass.
 * The Awtsmoos gives the NPC three redundant signs of life: the GLB model when
 * it loads, a bright procedural fallback body that always exists, and a tall
 * gold/cyan beacon visible from spawn. The level menu contract remains intact.
 */
import Medabeir from "../../chayim/medabeir/index.js?v=no-auto-dialogue-20260602-bh9";
import * as THREE from "/games/scripts/build/three.module.js";

const DEFAULT_DIALOGUES = ["Shalom! I guard the challenge path.", "Tap Choose Levels to see all available challenges.", "The village is only the beginning."];
const DEFAULT_SHOP = [
  { id: "blue_shirt", name: "Blue Shirt", icon: "👕", equipSlot: "shirt", price: 3, sellValue: 1, customData: { meshName: ["shirt", "outer-shirt"], color: "#4db8ff" } },
  { id: "gold_shirt", name: "Gold Shirt", icon: "👕", equipSlot: "shirt", price: 5, sellValue: 2, customData: { meshName: ["shirt", "outer-shirt"], color: "#ffd54a" } }
];
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const posOf = nivra => nivra?.mesh?.position || nivra?.modelMesh?.position || nivra?.guf?.position || null;
const hex = v => typeof v === "number" ? v : Number.parseInt(String(v || "ffd54a").replace("#", ""), 16);

function seal(root, nivra) {
  root?.traverse?.(child => {
    child.nivraAwtsmoos = nivra;
    child.userData ||= {};
    if (child.userData.awtsmoosRayProxy) Object.assign(child.userData, { skipRaycast: false, skipOctree: true, noOctree: true });
    else Object.assign(child.userData, { skipRaycast: true, skipOctree: true, noOctree: true, isNpcVisual: true });
  });
}
function enrichedSlots(player) { const inv = player?.inventory; return (inv?.slots || []).map(s => s && inv?.enrichItemData ? inv.enrichItemData(s) : s).filter(Boolean); }
function enrichedShop(player, items) { const inv = player?.inventory; return (items || []).map(s => inv?.enrichItemData ? inv.enrichItemData(s) : s); }
function mat(color) { return new THREE.MeshLambertMaterial({ color }); }
function basic(color, opacity = 1) { return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }); }

function fallbackBody(op = {}) {
  const g = new THREE.Group(); g.name = "ALWAYS_VISIBLE_LEVEL_GUIDE_FALLBACK_BODY";
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 1.18, 14), mat(0xffffff)); robe.position.y = 0.78;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), mat(0xf2c28a)); head.position.y = 1.52;
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 14), mat(0x7b421f)); beard.position.set(0, 1.22, 0.18); beard.rotation.x = Math.PI;
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 18), basic(0x111111)); hat.position.y = 1.78;
  const sign = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.045, 10, 32), basic(hex(op.beaconColor || 0x00ffd0))); sign.position.y = 2.28;
  g.add(robe, head, beard, hat, sign); return g;
}
function beacon(op = {}) {
  const color = hex(op.beaconColor || 0xffd54a), cyan = hex(op.guideCyan || 0x00ffd0), h = num(op.beaconHeight, 7.5);
  const g = new THREE.Group(); g.name = "IMPOSSIBLE_TO_MISS_LEVEL_GUIDE_BEACON";
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, h, 10), basic(color, 0.55)); pillar.position.y = h / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.055, 10, 36), basic(cyan, 0.92)); ring.position.y = 2.45;
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), basic(color, 0.95)); crown.position.y = h + 0.18;
  const floor = new THREE.Mesh(new THREE.RingGeometry(0.55, 1.15, 32), basic(cyan, 0.36)); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.04;
  g.add(pillar, ring, crown, floor); return g;
}

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc";
  static itemName = "Village Guide";
  static description = "A visible level guide with fallback body, beacon, and level menu.";
  constructor(op = {}, olam) {
    const clean = { ...op, dialogue: null, dialogues: null, messageTree: null };
    clean.proximity = num(op.proximity, 14); clean.talkDistance = num(op.talkDistance, clean.proximity);
    clean.interactable = true; clean.heesHawveh = true; clean.visualHeight = num(op.visualHeight, 1.8); clean.height = num(op.height, 1.8); clean.radius = num(op.radius, 0.52);
    clean.path ||= "https://models-3122d.web.app/chossid.glb?k=2"; clean.chaweeyoosMap ||= { idle: "dance silly", run: "dance silly", walk: "dance silly" }; clean.visualGroundBiasY ??= 0;
    super(clean, olam);
    this.options = op; this.dialogues = op.dialogues || op.dialogue || DEFAULT_DIALOGUES; this.shopInventory = op.shopInventory || DEFAULT_SHOP;
    this.height = clean.visualHeight; this.talkDistance = clean.talkDistance; this._lastTooFarAt = 0; this._lookTarget = null; this._makeRayProxy(); this._setupEvents();
  }
  _makeRayProxy() {
    const r = Math.max(3.2, this.talkDistance * 0.7);
    this.interactionMesh = new THREE.Mesh(new THREE.BoxGeometry(r, 3.2, r), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    Object.assign(this.interactionMesh.userData, { awtsmoosRayProxy: true, skipRaycast: false, skipOctree: true, noOctree: true });
    this.interactionMesh.nivraAwtsmoos = this; this.raycastMesh = this.interactionMesh;
  }
  async heescheel(olam) {
    await super.heescheel(olam); if (!this.mesh) this.mesh = new THREE.Object3D();
    Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, awtsmoosVillageGuide: true });
    this.mesh.nivraAwtsmoos = this; seal(this.mesh, this);
    this.fallbackMesh = fallbackBody(this.options); this.beaconMesh = beacon(this.options); this.interactionMesh.position.set(0, 1.05, 0);
    seal(this.fallbackMesh, this); seal(this.beaconMesh, this); this.mesh.add(this.fallbackMesh, this.beaconMesh, this.interactionMesh);
    if (typeof this.randomizeAppearance === "function") this.randomizeAppearance();
    if (olam.interactableNivrayim && !olam.interactableNivrayim.includes(this)) olam.interactableNivrayim.push(this);
    this.isReady = true;
  }
  async ready() { await super.ready(); seal(this.modelMesh || this.mesh, this); this.playGuideDance(); }
  _setupEvents() { this.on("accepted interaction", c => this.openGuideMenu(c)); this.on("pointerdown", c => this.openGuideMenu(c)); this.on("mouseEnter", () => this.olam?.ayshPeula?.("ui event", "tooltip", { show: true, text: "Choose Levels" })); this.on("mouseLeave", () => this.olam?.ayshPeula?.("ui event", "tooltip", { show: false })); }
  ayshPeula(peula, actor) { if (peula === "accepted interaction" || peula === "pointerdown") return this.openGuideMenu(actor); return super.ayshPeula?.(peula, actor); }
  findTalker(actor) { return posOf(actor) ? actor : this.olam?.chossid || this.olam?.player || null; }
  distanceTo(actor) { const a = posOf(actor), b = posOf(this); if (!a || !b) return 0; const dx = a.x - b.x, dz = a.z - b.z, dy = (a.y || 0) - (b.y || 0); return Math.sqrt(dx * dx + dz * dz + dy * dy * 0.12); }
  faceTalker(actor) { const a = posOf(actor), b = posOf(this); if (!a || !b || !this.mesh) return; const dx = a.x - b.x, dz = a.z - b.z; if (Math.abs(dx) + Math.abs(dz) > 0.001) this.mesh.rotation.y = Math.atan2(dx, dz); this._lookTarget = actor; }
  sayTooFar() { const now = Date.now(); if (now - this._lastTooFarAt < 800) return; this._lastTooFarAt = now; this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Walk to the glowing guide.", color: "#00ffd0", replace: true }); }
  payload(player) { return { fromNpc: this.name, title: "Village Guide", selectorTitle: this.options.selectorTitle || "Choose Levels", lines: this.dialogues, actions: ["levels", "buy", "sell"], shopInventory: enrichedShop(player, this.shopInventory), items: enrichedShop(player, this.shopInventory), playerInventory: enrichedSlots(player), entityId: this.id || this.name, npcName: this.name || "Village Guide" }; }
  openGuideMenu(actor) { const talker = this.findTalker(actor); if (this.distanceTo(talker) > this.talkDistance) { this.sayTooFar(); return false; } this.faceTalker(talker); this.olam.ayshPeula("ui event", "openNpcChallengeOverlay", this.payload(talker)); return true; }
  playGuideDance() { if (!this.playChaweeyoos || !this.animations?.length) return; this.playChaweeyoos("dance silly"); this.__awtsDanceStarted = true; }
  heesHawvoos(dt) { super.heesHawvoos(dt); if (!this.__awtsDanceStarted && this.animationMixer && this.animations?.length) this.playGuideDance(); if (this._lookTarget && this.distanceTo(this._lookTarget) <= this.talkDistance + 1) this.faceTalker(this._lookTarget); if (this.beaconMesh) this.beaconMesh.rotation.y += dt * 0.7; if (this.fallbackMesh) this.fallbackMesh.rotation.y += Math.sin(Date.now() * 0.003) * 0.0006; }
}
