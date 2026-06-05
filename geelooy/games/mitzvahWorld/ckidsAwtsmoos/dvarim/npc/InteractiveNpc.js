// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 149: The guide click must visibly open the menu.
 *
 * The guide exists and highlights, so ray ownership works. This file removes
 * fragile silent blockers: accepted explicit interactions now always dispatch
 * the HTML overlay, log proof, and do not vanish behind a distance check. The
 * visual mesh remains non-physics; the ray proxy alone receives clicks.
 */
import Medabeir from "../../chayim/medabeir/index.js?v=no-auto-dialogue-20260602-bh9";
import * as THREE from "/games/scripts/build/three.module.js";

const GUIDE_MODEL = "https://models-3122d.web.app/chossid.glb?k=1";
const DEFAULT_DIALOGUES = ["Shalom! I guard the challenge path.", "Tap Choose Levels to see all available challenges.", "The village is only the beginning."];
const DEFAULT_SHOP = [
  { id: "blue_shirt", name: "Blue Shirt", icon: "👕", equipSlot: "shirt", price: 3, sellValue: 1, customData: { meshName: ["shirt", "outer-shirt"], color: "#4db8ff" } },
  { id: "gold_shirt", name: "Gold Shirt", icon: "👕", equipSlot: "shirt", price: 5, sellValue: 2, customData: { meshName: ["shirt", "outer-shirt"], color: "#ffd54a" } }
];
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const posOf = nivra => nivra?.mesh?.position || nivra?.modelMesh?.position || nivra?.guf?.position || nivra?.player?.mesh?.position || null;
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
function isExplicitTap(ctx) {
  const type = ctx?.type || ctx?.event?.type || ctx?.originalEvent?.type;
  return ["pointerdown", "pointerup", "click", "touchend", "mousedown", "mouseup"].includes(type) || ctx?.explicit === true || ctx?.isPointer === true || ctx?.isTap === true;
}
function fallbackBody(op = {}) {
  const g = new THREE.Group(); g.name = "TEMP_GUIDE_FALLBACK_HIDDEN_WHEN_GLB_READY";
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1.16, 14), mat(0xffffff)); robe.position.y = 0.78;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 12), mat(0xf2c28a)); head.position.y = 1.5;
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 14), mat(0x7b421f)); beard.position.set(0, 1.2, 0.17); beard.rotation.x = Math.PI;
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.13, 18), basic(0x111111)); hat.position.y = 1.75;
  const sign = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 10, 32), basic(hex(op.guideCyan || 0x00ddff), 0.82)); sign.position.y = 2.2;
  g.add(robe, head, beard, hat, sign);
  return g;
}
function beacon(op = {}) {
  const color = hex(op.beaconColor || 0xffcc44), cyan = hex(op.guideCyan || 0x00ddff), h = num(op.beaconHeight, 4.8);
  const g = new THREE.Group(); g.name = "VISIBLE_LEVEL_GUIDE_SOFT_BEACON";
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, h, 8), basic(color, 0.24)); pillar.position.y = h / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 10, 32), basic(cyan, 0.64)); ring.position.y = 2.22;
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), basic(color, 0.7)); crown.position.y = h + 0.1;
  g.add(pillar, ring, crown);
  return g;
}

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc";
  static itemName = "Village Guide";
  static description = "A visible level guide with explicit tap-only menu.";

  constructor(op = {}, olam) {
    const clean = { ...op, dialogue: null, dialogues: null, messageTree: null };
    clean.proximity = num(op.proximity, 18);
    clean.talkDistance = num(op.talkDistance, clean.proximity);
    Object.assign(clean, { interactable: true, heesHawveh: true, visualHeight: num(op.visualHeight, 1.8), height: num(op.height, 1.8), radius: num(op.radius, 0.52) });
    clean.path = op.path || GUIDE_MODEL;
    clean.chaweeyoosMap ||= { idle: "dance silly", run: "dance silly", walk: "dance silly" };
    clean.visualGroundBiasY ??= 0;
    super(clean, olam);
    this.options = { ...op, path: clean.path };
    this.dialogues = op.dialogues || op.dialogue || DEFAULT_DIALOGUES;
    this.shopInventory = op.shopInventory || DEFAULT_SHOP;
    this.height = clean.visualHeight;
    this.talkDistance = clean.talkDistance;
    this._makeRayProxy();
    this._setupEvents();
  }

  _makeRayProxy() {
    const r = 3.4;
    this.interactionMesh = new THREE.Mesh(new THREE.BoxGeometry(r, 3.6, r), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    this.interactionMesh.name = "GUIDE_EXPLICIT_TAP_COLLIDER_RAYCAST_ONLY";
    this.interactionMesh.position.set(0, 1.25, 0);
    Object.assign(this.interactionMesh.userData, { awtsmoosRayProxy: true, explicitTapOnly: true, skipRaycast: false, skipOctree: true, noOctree: true });
    this.interactionMesh.nivraAwtsmoos = this;
    this.raycastMesh = this.interactionMesh;
  }

  async heescheel(olam) {
    await super.heescheel(olam);
    if (!this.mesh) this.mesh = new THREE.Object3D();
    Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, awtsmoosVillageGuide: true, tapOnlyGuide: true });
    this.mesh.nivraAwtsmoos = this;
    seal(this.mesh, this);
    this.fallbackMesh = fallbackBody(this.options);
    this.beaconMesh = beacon(this.options);
    seal(this.fallbackMesh, this);
    seal(this.beaconMesh, this);
    this.mesh.add(this.fallbackMesh, this.beaconMesh, this.interactionMesh);
    if (typeof this.randomizeAppearance === "function") this.randomizeAppearance();
    if (olam.interactableNivrayim && !olam.interactableNivrayim.includes(this)) olam.interactableNivrayim.push(this);
    this.isReady = true;
  }

  async ready() {
    await super.ready();
    seal(this.modelMesh || this.mesh, this);
    this.hideFallbackIfModelReady();
    this.playGuideDance();
  }

  _setupEvents() {
    this.on("pointerdown", c => this.openGuideMenu(c, true));
    this.on("pointerup", c => this.openGuideMenu(c, true));
    this.on("click", c => this.openGuideMenu(c, true));
  }

  ayshPeula(peula, actor) {
    if (peula === "pointerdown" || peula === "pointerup" || peula === "click") return this.openGuideMenu(actor, true);
    if (peula === "accepted interaction") {
      console.info('B"H | GUIDE_ACCEPTED_INTERACTION', { explicit: isExplicitTap(actor), type: actor?.type, hasPlayer: Boolean(actor?.player) });
      return isExplicitTap(actor) ? this.openGuideMenu(actor, true) : false;
    }
    return super.ayshPeula?.(peula, actor);
  }

  hideFallbackIfModelReady() {
    const hasReal = Boolean(this.modelMesh && this.modelMesh !== this.mesh);
    if (this.fallbackMesh) this.fallbackMesh.visible = !hasReal;
    return hasReal;
  }

  findTalker(actor) { return actor?.player || (posOf(actor) ? actor : this.olam?.chossid || this.olam?.player || null); }
  faceTalker(actor) {
    const a = posOf(actor), b = posOf(this);
    if (!a || !b || !this.mesh) return;
    const dx = a.x - b.x, dz = a.z - b.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.001) this.mesh.rotation.y = Math.atan2(dx, dz);
  }
  payload(player) {
    return {
      fromNpc: this.name,
      title: "Village Guide",
      selectorTitle: this.options.selectorTitle || "Choose Levels",
      lines: this.dialogues,
      actions: ["levels", "buy", "sell"],
      shopInventory: enrichedShop(player, this.shopInventory),
      items: enrichedShop(player, this.shopInventory),
      playerInventory: enrichedSlots(player),
      entityId: this.id || this.name,
      npcName: this.name || "Village Guide"
    };
  }
  openGuideMenu(actor, explicit = false) {
    if (!explicit && !isExplicitTap(actor)) return false;
    const talker = this.findTalker(actor);
    this.faceTalker(talker);
    const payload = this.payload(talker);
    console.info('B"H | GUIDE_OPEN_MENU_DISPATCH', { name: this.name, shaym: 'openNpcChallengeOverlay' });
    this.olam?.ayshPeula?.("ui event", "openNpcChallengeOverlay", payload);
    return true;
  }
  playGuideDance() {
    if (!this.playChaweeyoos || !this.animations?.length) return;
    this.playChaweeyoos("dance silly");
    this.__awtsDanceStarted = true;
  }
  heesHawvoos(dt) {
    super.heesHawvoos(dt);
    this.hideFallbackIfModelReady();
    if (!this.__awtsDanceStarted && this.animationMixer && this.animations?.length) this.playGuideDance();
    if (this.beaconMesh) this.beaconMesh.rotation.y += dt * 0.45;
  }
}
