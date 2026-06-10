// B"H
/**
 * @file Yichud.js
 * @description Chapter 564: World rays stop at UI, but UI controls still work.
 * Capture listeners block canvas interaction behind overlays without cancelling
 * the button handlers that live inside the overlay island.
 */
import Kav from "./methods/Kav.js";
import Ohr from "./methods/Ohr.js";
import Peula from "./methods/Peula.js";
const UI_BLOCKERS = ["[data-awts-ui-seal]", "#awtsmoos-npc-overlay", "#awtsmoos-npc-shop", "#inventoryScreen", "#storeScreen", ".store-container", ".awts-shop-card", ".awts-npc-card", ".awtsmoosAction", "#actionBar", "#joystick-container", "#game-controller", "button", "input", "select", "textarea", "a"];
function isUiEvent(event) { const target = event?.target; return Boolean(target?.closest && UI_BLOCKERS.some(selector => target.closest(selector))); }
function blockWorld(event) { event?.stopPropagation?.(); }
export default class Yichud {
  constructor(olam) { this.olam = olam; this.kav = new Kav(olam); this.ohr = new Ohr(); this.peula = new Peula(olam); this.currentIntersection = null; this.lastHoverUpdate = 0; this.init(); }
  init() { if (typeof window === "undefined") return; window.addEventListener("mousemove", event => this.handleMouseMove(event), true); window.addEventListener("mousedown", event => this.handleMouseDown(event), true); ['pointerdown','touchstart'].forEach(type => window.addEventListener(type, event => this.handleUiCapture(event), true)); }
  handleUiCapture(event) { if (!isUiEvent(event)) return; blockWorld(event); this.onHoverExit(); this.currentIntersection = null; }
  handleMouseMove(event) { if (isUiEvent(event)) return blockWorld(event); this.handleEvent(event, false); }
  handleMouseDown(event) { if (isUiEvent(event)) return blockWorld(event); this.handleEvent(event, true); }
  handleEvent(payload, isClick = false) { if (!this.olam.canvas && !this.olam.renderer) return; let x, y; if (payload.x !== undefined && payload.y !== undefined) { x = payload.x; y = payload.y; } else { const rect = { width: this.olam.width || 1920, height: this.olam.height || 1080 }; x = (payload.clientX / rect.width) * 2 - 1; y = -(payload.clientY / rect.height) * 2 + 1; } const now = Date.now(); if (isClick || now - this.lastHoverUpdate > 100) { this.lastHoverUpdate = now; this.update(x, y); } if (isClick && this.currentIntersection) this.peula.execute(this.currentIntersection); }
  update(x, y) { const hit = this.kav.cast(x, y); if (hit) { if (this.currentIntersection?.nivra !== hit.nivra) { this.onHoverExit(); this.currentIntersection = hit; this.onHoverEnter(); } return; } this.onHoverExit(); this.currentIntersection = null; }
  isInteractive(nivra) { const flag = nivra?.interactable || nivra?.options?.interactable; const type = nivra?.type; const known = type === "interactiveDoor" || type === "interactiveNpc" || type === "proceduralTree" || type === "customNpc"; const noise = type === "proceduralFlowerPatch" || type === "proceduralTerrain"; return (flag || known) && !noise; }
  onHoverEnter() { const hit = this.currentIntersection; if (!hit?.nivra || !this.isInteractive(hit.nivra)) return; this.ohr.highlight(hit.mesh, true); this.olam.ayshPeula("interactionHover", hit.nivra); hit.nivra.ayshPeula?.("mouseEnter"); if (typeof document !== "undefined") document.body.style.cursor = "pointer"; }
  onHoverExit() { const hit = this.currentIntersection; if (!hit?.nivra || !this.isInteractive(hit.nivra)) return; this.ohr.highlight(hit.mesh, false); this.olam.ayshPeula("interactionExit", hit.nivra); hit.nivra.ayshPeula?.("mouseLeave"); if (typeof document !== "undefined") document.body.style.cursor = "default"; }
}
