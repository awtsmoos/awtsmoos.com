// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 516: The NPC becomes a conductor. Tap behavior, payload, collider,
 * and the guide visual rig are separated into clear acts while the central
 * Mitzvah Level Guide now consumes its visualRig instead of ignoring it.
 */
import Medabeir from "../../chayim/medabeir/index.js?v=no-auto-dialogue-20260602-bh9";
import * as THREE from "/games/scripts/build/three.module.js";
import { buildGuideVisualFromRig } from "./guide/runtime/GuideVisualFactory.js";
const GUIDE_MODEL = "https://models-3122d.web.app/chossid.glb?k=1";
const DEFAULT_DIALOGUES = ["Shalom! I guard the challenge path.", "Tap Levels to open all available challenges.", "The village grows when mitzvos become action."];
const DEFAULT_SHOP = [
  { id: "blue_shirt", name: "Blue Shirt", icon: "👕", equipSlot: "shirt", price: 3, sellValue: 1, customData: { meshName: ["shirt", "outer-shirt"], color: "#4db8ff" } },
  { id: "gold_shirt", name: "Gold Shirt", icon: "👕", equipSlot: "shirt", price: 5, sellValue: 2, customData: { meshName: ["shirt", "outer-shirt"], color: "#ffd54a" } }
];
const DEFAULT_STATS = Object.freeze({ wisdom: 18, kindness: 22, courage: 12, trade: 9, growth: 17, light: 20 });
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const posOf = n => n?.mesh?.position || n?.modelMesh?.position || n?.guf?.position || n?.player?.mesh?.position || null;
const isExplicitTap = ctx => ["pointerdown", "pointerup", "click", "touchend", "mousedown", "mouseup"].includes(ctx?.type || ctx?.event?.type || ctx?.originalEvent?.type) || ctx?.explicit === true || ctx?.isPointer === true || ctx?.isTap === true;
function seal(root, nivra) {
  root?.traverse?.(child => { child.nivraAwtsmoos = nivra; child.userData ||= {}; Object.assign(child.userData, child.userData.awtsmoosRayProxy ? { skipRaycast: false, skipOctree: true, noOctree: true } : { skipRaycast: true, skipOctree: true, noOctree: true, isNpcVisual: true }); });
}
function enrichedSlots(player) { const inv = player?.inventory; return (inv?.slots || []).map(s => s && inv?.enrichItemData ? inv.enrichItemData(s) : s).filter(Boolean); }
function enrichedShop(player, items) { const inv = player?.inventory; return (items || []).map(s => inv?.enrichItemData ? inv.enrichItemData(s) : s); }
function makeRayProxy(nivra) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.6, 3.4), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  mesh.name = "GUIDE_EXPLICIT_TAP_COLLIDER_RAYCAST_ONLY";
  mesh.position.set(0, 1.25, 0);
  Object.assign(mesh.userData, { awtsmoosRayProxy: true, explicitTapOnly: true, skipRaycast: false, skipOctree: true, noOctree: true });
  mesh.nivraAwtsmoos = nivra;
  return mesh;
}
function fallbackRig(op = {}) {
  return op.visualRig || { kind: 'fallback-guide', clothing: [{ meshName: ['robe'], color: '#f7f2df' }, { meshName: ['vest'], color: '#2f5fa8' }, { meshName: ['belt'], color: '#6d4424' }], face: { eyes: { irisColor: [0.08, 0.08, 0.08] }, yarmulke: { color: '#101014' }, beard: { colorTip: [0.44, 0.25, 0.12] } } };
}
export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc"; static itemName = "Village Guide"; static description = "A visible tap-only level guide with stats, shop, and rigged visual metadata.";
  constructor(op = {}, olam) {
    const clean = { ...op, dialogue: null, dialogues: null, messageTree: null, proximity: num(op.proximity, 18), talkDistance: num(op.talkDistance, num(op.proximity, 18)), interactable: true, heesHawveh: true, visualHeight: num(op.visualHeight, 1.8), height: num(op.height, 1.8), radius: num(op.radius, 0.52), path: op.path || GUIDE_MODEL, chaweeyoosMap: op.chaweeyoosMap || { idle: "dance silly", run: "dance silly", walk: "dance silly" } };
    super(clean, olam);
    this.options = { ...op, path: clean.path };
    this.dialogues = op.dialogues || op.dialogue || DEFAULT_DIALOGUES;
    this.shopInventory = op.shopInventory || DEFAULT_SHOP;
    this.areaStats = op.areaStats || op.npcStats || DEFAULT_STATS;
    this.visualRig = fallbackRig(op);
    this.height = clean.visualHeight;
    this.talkDistance = clean.talkDistance;
    this.interactionMesh = makeRayProxy(this);
    this.raycastMesh = this.interactionMesh;
    this.on("pointerdown", c => this.openGuideMenu(c, true));
    this.on("pointerup", c => this.openGuideMenu(c, true));
    this.on("click", c => this.openGuideMenu(c, true));
  }
  async heescheel(olam) {
    await super.heescheel(olam);
    if (!this.mesh) this.mesh = new THREE.Object3D();
    Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, awtsmoosVillageGuide: true, tapOnlyGuide: true });
    this.mesh.nivraAwtsmoos = this;
    seal(this.mesh, this);
    this.guideVisualMesh = buildGuideVisualFromRig(this.visualRig);
    seal(this.guideVisualMesh, this);
    this.mesh.add(this.guideVisualMesh, this.interactionMesh);
    if (typeof this.randomizeAppearance === "function") this.randomizeAppearance();
    if (olam.interactableNivrayim && !olam.interactableNivrayim.includes(this)) olam.interactableNivrayim.push(this);
    this.isReady = true;
  }
  async ready() { await super.ready(); seal(this.modelMesh || this.mesh, this); this.hideRigVisualIfModelReady(); this.playGuideDance(); }
  ayshPeula(peula, actor) { if (["pointerdown", "pointerup", "click"].includes(peula)) return this.openGuideMenu(actor, true); if (peula === "accepted interaction") return isExplicitTap(actor) ? this.openGuideMenu(actor, true) : false; return super.ayshPeula?.(peula, actor); }
  hideRigVisualIfModelReady() { const hasReal = Boolean(this.modelMesh && this.modelMesh !== this.mesh); if (this.guideVisualMesh) this.guideVisualMesh.visible = !hasReal; return hasReal; }
  findTalker(actor) { return actor?.player || (posOf(actor) ? actor : this.olam?.chossid || this.olam?.player || null); }
  faceTalker(actor) { const a = posOf(actor), b = posOf(this); if (!a || !b || !this.mesh) return; const dx = a.x - b.x, dz = a.z - b.z; if (Math.abs(dx) + Math.abs(dz) > 0.001) this.mesh.rotation.y = Math.atan2(dx, dz); }
  payload(player) { return { fromNpc: this.name, title: this.options.title || "Village Guide", selectorTitle: this.options.selectorTitle || "Choose Levels", lines: this.dialogues, actions: ["levels", "buy", "sell"], shopInventory: enrichedShop(player, this.shopInventory), items: enrichedShop(player, this.shopInventory), playerInventory: enrichedSlots(player), entityId: this.id || this.name, npcName: this.name || "Village Guide", npcStats: this.areaStats, areaStats: this.areaStats, areaName: this.options.areaName || "First Entry Village", areaNote: this.options.areaNote || "Talk, choose levels, buy, sell, and grow.", visualRig: this.visualRig }; }
  openGuideMenu(actor, explicit = false) { if (!explicit && !isExplicitTap(actor)) return false; const talker = this.findTalker(actor); this.faceTalker(talker); this.olam?.ayshPeula?.("ui event", "openNpcChallengeOverlay", this.payload(talker)); return true; }
  playGuideDance() { if (!this.playChaweeyoos || !this.animations?.length) return; this.playChaweeyoos("dance silly"); this.__awtsDanceStarted = true; }
  heesHawvoos(dt) { super.heesHawvoos(dt); this.hideRigVisualIfModelReady(); if (!this.__awtsDanceStarted && this.animationMixer && this.animations?.length) this.playGuideDance(); if (this.guideVisualMesh) this.guideVisualMesh.rotation.y += dt * 0.12; }
}
