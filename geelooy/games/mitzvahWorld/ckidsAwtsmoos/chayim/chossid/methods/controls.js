// B"H
/**
 * @file controls.js
 * @description
 * Chapter 43: the command is explicit, so the signs reverse.
 * W now performs the old S role, S performs the old W role. Q now performs the
 * old E role, E performs the old Q role. No philosophy, only obedience: the
 * Awtsmoos turns the compass by the user's word and records the covenant in the
 * copyable diagnostic scroll.
 */
import { diagThrottle, diagEvent } from "../../../utils/AwtsmoosDiagnostics.js?v=village-diagnostics-20260612-bh1";

const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyZ";
const CAMERA_FPS_TOGGLE = "KeyT";
const ACTION_TOGGLE = "KeyC";
const ACTION_SELECT = "Enter";
const DISMOUNT_KEY = "KeyX";
const MOVE_KEYS = ["forward", "backward", "turningLeft", "turningRight", "stridingLeft", "stridingRight", "jump"];
let announced = false;

function keyOn(olam, ...codes) { return codes.some(code => !!olam?.keyStates?.[code]); }
function flag(inputs, key) { return inputs?.[key] === true; }
function hardMovementFreeze(chossid) { return Boolean(chossid.__spikeDeathControlsFrozen || chossid.__spikeDefeated); }
function inputMap(chossid) { return chossid.olam?.inputs || {}; }
function activeMove(moving) { return MOVE_KEYS.filter(key => moving?.[key]); }
function uiFrozen(olam) { return Boolean(olam?.showingImportantMessage || olam?.__awtsmoosUiPointerCaptureUntil > Date.now()); }
function stopUiPointer(event) { event?.preventDefault?.(); event?.stopPropagation?.(); event?.stopImmediatePropagation?.(); }
function markUiCapture(olam) { if (!olam) return; olam.__awtsmoosUiPointerCaptureUntil = Date.now() + 280; olam.__awtsmoosSuppressCameraUntil = Date.now() + 650; }
function announceReversal() { if (announced) return; announced = true; diagEvent("controls-mapping", { W: "backward", S: "forward", Q: "strafeRight", E: "strafeLeft", A: "turnLeft", D: "turnRight" }); }
function traceControls(chossid, stage) {
  const active = activeMove(chossid.moving);
  if (!active.length && stage === "controls-applied") return;
  diagThrottle("controls", { stage, active, keys: Object.keys(chossid.olam?.keyStates || {}).filter(k => chossid.olam.keyStates[k]), inputs: Object.keys(chossid.olam?.inputs || {}).filter(k => chossid.olam.inputs[k]), rotY: chossid.rotation?.y }, 500);
}

export default {
  controls() {
    announceReversal();
    this.resetMoving();
    if (hardMovementFreeze(this)) { traceControls(this, "hard-freeze"); return; }
    if (this.isDriving && this.drivingVehicle) { if (this.olam.keyStates?.[DISMOUNT_KEY]) this.drivingVehicle.dismount?.(); return; }
    if (uiFrozen(this.olam)) { traceControls(this, "ui-freeze"); return; }
    const inputs = inputMap(this);
    this.moving.running = flag(inputs, "RUNNING") || keyOn(this.olam, "ShiftLeft", "ShiftRight");
    this.moving.forward = flag(inputs, "BACKWARD") || keyOn(this.olam, "KeyS", "ArrowDown");
    this.moving.backward = flag(inputs, "FORWARD") || keyOn(this.olam, "KeyW", "ArrowUp");
    this.moving.turningLeft = flag(inputs, "LEFT_ROTATE") || keyOn(this.olam, "KeyA", "ArrowLeft");
    this.moving.turningRight = flag(inputs, "RIGHT_ROTATE") || keyOn(this.olam, "KeyD", "ArrowRight");
    this.moving.stridingLeft = flag(inputs, "RIGHT_STRIDE") || keyOn(this.olam, "KeyE");
    this.moving.stridingRight = flag(inputs, "LEFT_STRIDE") || keyOn(this.olam, "KeyQ");
    this.moving.jump = flag(inputs, "JUMP") || keyOn(this.olam, "Space");
    this.moving.down = flag(inputs, "DOWN") || keyOn(this.olam, "KeyX");
    this.moving.up = flag(inputs, "UP");
    traceControls(this, "controls-applied");
    this.cameraControls();
  },
  movingSounds() {},
  cameraControls() { if (uiFrozen(this.olam)) return; if (this.olam.keyStates?.[CAMERA_PAN_UP]) this.olam.ayin?.panUp?.(); else if (this.olam.keyStates?.[CAMERA_PAN_DOWN]) this.olam.ayin?.panDown?.(); },
  dialogueControls(event) { if (!this.interactingWith) return; const n = Number.parseInt(event?.key, 10); if (n >= 1 && n <= 9) this.interactingWith.toggleToOption?.(n - 1); },
  setupInputListeners(olam) {
    olam.on("mousedown", event => {
      if (hardMovementFreeze(this)) return;
      if (uiFrozen(olam)) return stopUiPointer(event);
      if (event.button === 0) { const handled = this.handleClick?.(event); if (handled) { markUiCapture(olam); stopUiPointer(event); return; } this.shoot?.(); }
      if (event.button === 2) this.getRealActiveItemInstance?.();
    });
    olam.on("keypressed", async event => { if (hardMovementFreeze(this)) return; this.ayshPeula("keypressed", event); this.dialogueControls(event); await this.handlePlatformerKey(event); });
  },
  async handlePlatformerKey(event = {}) {
    if (uiFrozen(this.olam) && !["Escape", "Enter", "Digit1", "Digit2", "Digit3"].includes(event.code)) return;
    switch (event.code) {
      case "NumLock": this.movingAutomatically = !this.movingAutomatically; break;
      case DISMOUNT_KEY: if (this.isDriving && this.drivingVehicle) this.drivingVehicle.dismount?.(); break;
      case ACTION_TOGGLE: await this.activateNearbyOrTool(); break;
      case ACTION_SELECT: await this.selectFocusedThing(); break;
      case CAMERA_FPS_TOGGLE: if (this.olam.ayin) { this.olam.ayin.isFPS = !this.olam.ayin.isFPS; this.olam.ayshPeula("setFPS", this.olam.ayin.isFPS); } break;
      case "Space": this.olam.ayshPeula("setInput", { code: "Space" }); setTimeout(() => this.olam.ayshPeula("setInputOut", { code: "Space" }), 80); break;
      case "Tab": event.preventDefault?.(); this.cycleApproachedEntities(); break;
      default: break;
    }
  },
  async activateNearbyOrTool() {
    const activeItem = this.getActiveItem?.();
    if (activeItem?.isPainter) { this.isPaintingMode = !this.isPaintingMode; this.olam.ayshPeula("ui event", "effectsOverlay", { text: this.isPaintingMode ? "Painting Mode: ON" : "Painting Mode: OFF", color: this.isPaintingMode ? "#00ff00" : "#ff0000" }); return; }
    const target = this.interactingWith || this.approachedEntities?.[0];
    if (target?.ayshPeula && target.ayshPeula("accepted interaction", this) !== false) { markUiCapture(this.olam); return; }
    this.shoot?.();
  },
  async selectFocusedThing() { if (this.selected) return void this.selectMenuOption?.(); if (this.interactingWith?.selectOption) return void await this.interactingWith.selectOption(); if (this.intersected) return void await this.selectIntersected?.(); },
  cycleApproachedEntities() { if (!Array.isArray(this.approachedEntities) || this.approachedEntities.length <= 1) return; const last = this.approachedEntities.shift(); this.approachedEntities.push(last); const current = this.approachedEntities[0]; current?.ayshPeula?.("gained interaction focus", this); last?.ayshPeula?.("lost interaction focus", this); current?._showInteractionPrompt?.(); },
  resetPreviewRotation() { this.placementRotation = 0; },
  handleEditorClick() {}
};
