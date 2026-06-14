// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 519: the still villager began breathing again.
 * The Awtsmoos hides no life in frozen meshes: the guide now advances his
 * animation mixer every frame, opens panels as a pointer-safe overlay, and tells
 * the camera-orbit beast to wait outside while dialogue, shop, and level-choice
 * become clear vessels.
 */
import Medabeir from "../../chayim/medabeir/index.js?v=no-auto-dialogue-20260602-bh9";
import * as THREE from "/games/scripts/build/three.module.js";
import { buildGuideVisualFromRig } from "./guide/runtime/GuideVisualFactory.js";
import { isDrawableMaterial, shouldHideLivingNode } from "../../Olam/worlds/mitzvahWorld/npcs/LivingModelSanitizer.js";

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

function stopPointer(ctx) { const e = ctx?.event || ctx?.originalEvent || ctx; e?.preventDefault?.(); e?.stopPropagation?.(); e?.stopImmediatePropagation?.(); }
function holdUi(olam, ms = 900) { if (!olam) return; olam.showingImportantMessage = true; olam.__awtsmoosUiPointerCaptureUntil = Date.now() + ms; olam.__awtsmoosSuppressCameraUntil = Date.now() + ms; try { globalThis.document?.exitPointerLock?.(); } catch (_) {} setTimeout(() => releaseUi(olam), ms + 35); }
function releaseUi(olam) { if (!olam) return; const until = Number(olam.__awtsmoosUiPointerCaptureUntil || 0); if (!until || until <= Date.now() + 40) { olam.showingImportantMessage = false; olam.__awtsmoosUiPointerCaptureUntil = 0; olam.__awtsmoosSuppressCameraUntil = 0; } }
function seal(root, nivra) { root?.traverse?.(child => { child.nivraAwtsmoos = nivra; child.userData ||= {}; Object.assign(child.userData, child.userData.awtsmoosRayProxy ? { skipRaycast: false, skipOctree: true, noOctree: true } : { skipRaycast: true, skipOctree: true, noOctree: true, isNpcVisual: true }); }); }
function enrichedSlots(player) { const inv = player?.inventory; return (inv?.slots || []).map(s => s && inv?.enrichItemData ? inv.enrichItemData(s) : s).filter(Boolean); }
function enrichedShop(player, items) { const inv = player?.inventory; return (items || []).map(s => inv?.enrichItemData ? inv.enrichItemData(s) : s); }
function makeRayProxy(nivra) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.6, 3.4), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); mesh.name = "GUIDE_EXPLICIT_TAP_COLLIDER_RAYCAST_ONLY"; mesh.position.set(0, 1.25, 0); Object.assign(mesh.userData, { awtsmoosRayProxy: true, explicitTapOnly: true, skipRaycast: false, skipOctree: true, noOctree: true }); mesh.nivraAwtsmoos = nivra; return mesh; }
function fallbackRig(op = {}) { return op.visualRig || { kind: "fallback-guide", clothing: [{ meshName: ["robe"], color: "#f7f2df" }, { meshName: ["vest"], color: "#2f5fa8" }, { meshName: ["belt"], color: "#6d4424" }], face: { eyes: { irisColor: [0.08, 0.08, 0.08] }, yarmulke: { color: "#101014" }, beard: { colorTip: [0.44, 0.25, 0.12] } } }; }
function guideCarrierGolem() { return { name: "NPC_INVISIBLE_CARRIER", guf: { BoxGeometry: [0.01, 0.01, 0.01] }, toyr: { MeshBasicMaterial: { color: 0xffffff, transparent: true, opacity: 0, depthWrite: false } } }; }
function hasVisibleRealMesh(root) { let found = false; root?.traverse?.(child => { if (found || (!child?.isMesh && !child?.isSkinnedMesh)) return; if (child.userData?.isNpcVisual || child.name === "NPC_INVISIBLE_CARRIER") return; if (child.visible === false || shouldHideLivingNode(child)) return; const materials = Array.isArray(child.material) ? child.material : [child.material]; if (!materials.some(isDrawableMaterial)) return; const count = child.geometry?.attributes?.position?.count || child.geometry?.index?.count || 0; if (count > 0) found = true; }); return found; }
function hideCarrierMesh(root) { root?.traverse?.(child => { if (child?.name !== "NPC_INVISIBLE_CARRIER" && child?.geometry?.parameters?.width !== 0.01) return; const mats = Array.isArray(child.material) ? child.material : [child.material]; mats.forEach(mat => { if (!mat) return; mat.transparent = true; mat.opacity = 0; mat.depthWrite = false; mat.visible = true; }); }); }
function disposeVisual(root) { root?.traverse?.(child => { child.geometry?.dispose?.(); const mats = Array.isArray(child.material) ? child.material : [child.material]; mats.forEach(mat => mat?.dispose?.()); }); root?.removeFromParent?.(); }
function garmentName(child) { return String(child?.userData?.garment || child?.name || "").toLowerCase(); }
function paletteColor(palette, name) { if (/jacket|coat|robe|outer-shirt|vest/.test(name)) return palette.coat; if (/shirt/.test(name)) return palette.shirt; if (/pants|trouser|leg/.test(name)) return palette.pants; if (/shoe|boot/.test(name)) return palette.shoes; if (/hat|yamulka|yarmulke/.test(name)) return palette.hatColor; return null; }
function applyNpcPalette(root, palette = {}) { root?.traverse?.(child => { if (!child?.isMesh && !child?.isSkinnedMesh) return; const name = garmentName(child); if (name === "top-hat" || name.includes("top_hat")) child.visible = palette.hatStyle !== "yamulka"; if (/yamulka|yarmulke/.test(name)) child.visible = palette.hatStyle === "yamulka"; const color = paletteColor(palette, name); if (!color || !child.material) return; if (!child.userData.npcPaletteCloned) { child.material = Array.isArray(child.material) ? child.material.map(mat => mat.clone()) : child.material.clone(); child.userData.npcPaletteCloned = true; } const mats = Array.isArray(child.material) ? child.material : [child.material]; mats.forEach(mat => { mat.color?.set?.(color); mat.needsUpdate = true; }); }); }
function preferredStandingClip(npc) { return npc.animations?.find(anim => /stand|idle|breath|rest/i.test(anim.name) && !/dance|walk|run/i.test(anim.name)) || npc.animations?.[0] || null; }

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc"; static itemName = "Village Guide"; static description = "A tap-only level guide with real Chossid GLB support.";
  constructor(op = {}, olam) {
    const realModelRequested = op.useRealNpcModel === true;
    const clean = { ...op, dialogue: null, dialogues: null, messageTree: null, proximity: num(op.proximity, 18), talkDistance: num(op.talkDistance, num(op.proximity, 18)), interactable: true, heesHawveh: true, visualHeight: num(op.visualHeight, 1.8), height: num(op.height, 1.8), radius: num(op.radius, 0.52), path: realModelRequested ? (op.path || GUIDE_MODEL) : null, golem: realModelRequested ? op.golem : guideCarrierGolem(), chaweeyoosMap: op.chaweeyoosMap || { idle: "stand", run: "walk", walk: "walk", stand: "stand" } };
    super(clean, olam);
    this.realModelRequested = realModelRequested; this.options = { ...op, path: clean.path };
    this.dialogues = op.dialogues || op.dialogue || DEFAULT_DIALOGUES;
    this.shopInventory = op.shopInventory || DEFAULT_SHOP; this.areaStats = op.areaStats || op.npcStats || DEFAULT_STATS;
    this.visualRig = fallbackRig(op); this.height = clean.visualHeight; this.talkDistance = clean.talkDistance;
    this.interactionMesh = makeRayProxy(this); this.raycastMesh = this.interactionMesh;
    this.__standingClipName = null; this.__lastNpcAnimationTick = 0;
    this.on("pointerdown", c => this.openGuideMenu(c, true)); this.on("pointerup", c => this.openGuideMenu(c, true)); this.on("click", c => this.openGuideMenu(c, true));
  }
  async heescheel(olam) { await super.heescheel(olam); if (!this.mesh) this.mesh = new THREE.Object3D(); Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, awtsmoosVillageGuide: true, tapOnlyGuide: true }); this.mesh.nivraAwtsmoos = this; seal(this.mesh, this); if (!this.realModelRequested) { this.guideVisualMesh = buildGuideVisualFromRig(this.visualRig); seal(this.guideVisualMesh, this); this.mesh.add(this.guideVisualMesh); } this.mesh.add(this.interactionMesh); if (olam.interactableNivrayim && !olam.interactableNivrayim.includes(this)) olam.interactableNivrayim.push(this); this.isReady = true; }
  async ready() { await super.ready(); seal(this.modelMesh || this.mesh, this); hideCarrierMesh(this.modelMesh); applyNpcPalette(this.modelMesh, this.options.palette || {}); this.resolveVisualBody(); this.setStandingPose(true); this.heesHawveh = true; }
  ayshPeula(peula, actor) { if (["pointerdown", "pointerup", "click"].includes(peula)) return this.openGuideMenu(actor, true); if (peula === "accepted interaction") return isExplicitTap(actor) ? this.openGuideMenu(actor, true) : false; return super.ayshPeula?.(peula, actor); }
  resolveVisualBody() { const hasReal = hasVisibleRealMesh(this.modelMesh); if ((hasReal || this.realModelRequested) && this.guideVisualMesh) { disposeVisual(this.guideVisualMesh); this.guideVisualMesh = null; } else if (this.guideVisualMesh) this.guideVisualMesh.visible = true; return hasReal; }
  findTalker(actor) { return actor?.player || (posOf(actor) ? actor : this.olam?.chossid || this.olam?.player || null); }
  faceTalker(actor) { const a = posOf(actor), b = posOf(this); if (!a || !b || !this.mesh) return; const dx = a.x - b.x, dz = a.z - b.z; if (Math.abs(dx) + Math.abs(dz) > 0.001) this.mesh.rotation.y = Math.atan2(dx, dz); }
  payload(player) { return { fromNpc: this.name, title: this.options.title || "Village Guide", selectorTitle: this.options.selectorTitle || "Choose Levels", lines: this.dialogues, shopInventory: enrichedShop(player, this.shopInventory), items: enrichedShop(player, this.shopInventory), playerInventory: enrichedSlots(player), entityId: this.id || this.name, npcName: this.name || "Village Guide", npcStats: this.areaStats, areaStats: this.areaStats, areaName: this.options.areaName || "First Entry Village", areaNote: this.options.areaNote || "Talk, choose levels, buy, sell, and grow.", opensLevelSelect: this.options.opensLevelSelect !== false, hasShop: this.options.hasShop !== false, travelPath: this.options.travelPath || null, travelLabel: this.options.travelLabel || null, travelOnly: Boolean(this.options.travelOnly), missionId: this.options.missionId || null, missionLabel: this.options.missionLabel || null, learnSkillId: this.options.learnSkillId || null, learnSkillLabel: this.options.learnSkillLabel || null, visualRig: this.visualRig, safePointerOverlay: true }; }
  openGuideMenu(actor, explicit = false) { if (!explicit && !isExplicitTap(actor)) return false; stopPointer(actor); const talker = this.findTalker(actor); const a = posOf(talker), b = posOf(this); if (a && b && a.distanceTo?.(b) > this.talkDistance) { if (this.olam) { this.olam.showingImportantMessage = false; } this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - Move closer to ${this.name} to talk.`, type: "info" }); return false; } holdUi(this.olam); this.faceTalker(talker); this.olam?.ayshPeula?.("ui event", "openNpcChallengeOverlay", this.payload(talker)); setTimeout(() => releaseUi(this.olam), 980); return true; }
  setStandingPose(force = false) { const clip = preferredStandingClip(this); if (!clip || !this.animationMixer) return; const name = clip.name; if (!force && this.__standingClipName === name) return; this.__standingClipName = name; this.animationMixer.stopAllAction(); this.playChaweeyoos?.(name, { duration: 0.08, loop: true, force: true, timeScale: 0.72 }); }
  tickFallbackVisual(delta = 1 / 60) { if (!this.guideVisualMesh) return; const now = (globalThis.performance?.now?.() || Date.now()) * 0.001; this.guideVisualMesh.position.y = Math.sin(now * 1.7) * 0.025; this.guideVisualMesh.rotation.y += Math.sin(now * 0.83) * 0.0009 * Math.min(3, delta * 60); }
  heesHawvoos(delta = 1 / 60) { const dt = Math.min(0.1, num(delta, 1 / 60)); if (this.animationMixer?.update) { this.setStandingPose(false); this.animationMixer.update(dt); this.__lastNpcAnimationTick = Date.now(); } this.tickFallbackVisual(dt); }
}
