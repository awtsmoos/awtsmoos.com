// B"H
/** @file controls.js @description Movement keys: A strafes, E turns, no frozen jump. */
const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyZ";
const CAMERA_FPS_TOGGLE = "KeyT";
const ACTION_TOGGLE = "KeyC";
const ACTION_SELECT = "Enter";
const DISMOUNT_KEY = "KeyX";
const LEFT_STRIDE_KEY = "KeyA";
const RIGHT_STRIDE_KEY = "KeyQ";
const LEFT_TURN_KEY = "KeyE";
const RIGHT_TURN_KEY = "KeyD";
const on = (olam, ...codes) => codes.some(code => !!olam?.keyStates?.[code]);
const flag = (inputs, key) => inputs?.[key] === true;
function passMouseToWorld(chossid, event = {}) {
  if (chossid.__spikeDeathControlsFrozen || chossid.__spikeDefeated) return;
  if (event.button === 2) event.preventDefault?.();
  if (event.button === 0 || event.button === 2) chossid.handleClick?.(event);
  if (event.button === 2) chossid.getRealActiveItemInstance?.();
}
function movementInputs(player) {
  const inputs = player.olam.inputs || {};
  player.moving.running = inputs.RUNNING !== false || on(player.olam, "ShiftLeft", "ShiftRight");
  player.moving.forward = flag(inputs, "FORWARD") || on(player.olam, "KeyW", "ArrowUp");
  player.moving.backward = flag(inputs, "BACKWARD") || on(player.olam, "KeyS", "ArrowDown");
  player.moving.turningLeft = flag(inputs, "LEFT_ROTATE") || on(player.olam, LEFT_TURN_KEY, "ArrowLeft");
  player.moving.turningRight = flag(inputs, "RIGHT_ROTATE") || on(player.olam, RIGHT_TURN_KEY, "ArrowRight");
  player.moving.stridingLeft = flag(inputs, "LEFT_STRIDE") || on(player.olam, LEFT_STRIDE_KEY);
  player.moving.stridingRight = flag(inputs, "RIGHT_STRIDE") || on(player.olam, RIGHT_STRIDE_KEY);
  player.moving.jump = flag(inputs, "JUMP") || on(player.olam, "Space");
  player.moving.down = flag(inputs, "DOWN") || on(player.olam, "KeyX");
  player.moving.up = flag(inputs, "UP");
}
export default {
  controls() { this.resetMoving(); if (this.__spikeDeathControlsFrozen || this.__spikeDefeated) return; if (this.isDriving && this.drivingVehicle) { if (this.olam.keyStates?.[DISMOUNT_KEY]) this.drivingVehicle.dismount?.(); return; } if (this.olam.showingImportantMessage) return; movementInputs(this); this.cameraControls(); },
  movingSounds() {},
  cameraControls() { if (this.olam.keyStates?.[CAMERA_PAN_UP]) this.olam.ayin?.panUp?.(); else if (this.olam.keyStates?.[CAMERA_PAN_DOWN]) this.olam.ayin?.panDown?.(); },
  dialogueControls(event) { if (!this.interactingWith) return; const n = Number.parseInt(event?.key, 10); if (n >= 1 && n <= 9) this.interactingWith.toggleToOption?.(n - 1); },
  setupInputListeners(olam) {
    olam.on("mousedown", event => passMouseToWorld(this, event));
    olam.on("pointerdown", event => passMouseToWorld(this, { ...event, button:Number(event?.button || 0), type:"pointerdown" }));
    olam.on("touchstart", event => passMouseToWorld(this, { ...event, button:0, type:"touchstart", pointerType:"touch", isTouch:true, isTap:true }));
    olam.on("contextmenu", event => passMouseToWorld(this, { ...event, button:2, type:"contextmenu" }));
    olam.on("keypressed", async event => { if (this.__spikeDeathControlsFrozen || this.__spikeDefeated) return; this.ayshPeula("keypressed", event); this.dialogueControls(event); await this.handlePlatformerKey(event); });
  },
  async handlePlatformerKey(event = {}) {
    switch (event.code) {
      case "NumLock": this.movingAutomatically = !this.movingAutomatically; break;
      case DISMOUNT_KEY: if (this.isDriving && this.drivingVehicle) this.drivingVehicle.dismount?.(); break;
      case ACTION_TOGGLE: await this.activateNearbyOrTool(); break;
      case ACTION_SELECT: await this.selectFocusedThing(); break;
      case CAMERA_FPS_TOGGLE: if (this.olam.ayin) { this.olam.ayin.isFPS = !this.olam.ayin.isFPS; this.olam.ayshPeula("setFPS", this.olam.ayin.isFPS); } break;
      case "Space": this.olam.ayshPeula("setInput", { code:"Space" }); setTimeout(() => this.olam.ayshPeula("setInputOut", { code:"Space" }), 110); break;
      case "Tab": event.preventDefault?.(); this.cycleApproachedEntities(); break;
      default: break;
    }
  },
  async activateNearbyOrTool() { const activeItem = this.getActiveItem?.(); if (activeItem?.isPainter) { this.isPaintingMode = !this.isPaintingMode; this.olam.ayshPeula("ui event", "effectsOverlay", { text:this.isPaintingMode ? "Painting Mode: ON" : "Painting Mode: OFF", color:this.isPaintingMode ? "#00ff00" : "#ff0000" }); return; } const target = this.interactingWith || this.approachedEntities?.[0]; if (target?.ayshPeula) target.ayshPeula("accepted interaction", this); else this.shoot?.(); },
  async selectFocusedThing() { if (this.selected) return void this.selectMenuOption?.(); if (this.interactingWith?.selectOption) return void await this.interactingWith.selectOption(); if (this.intersected) return void await this.selectIntersected?.(); },
  cycleApproachedEntities() { if (!Array.isArray(this.approachedEntities) || this.approachedEntities.length <= 1) return; const last = this.approachedEntities.shift(); this.approachedEntities.push(last); this.approachedEntities[0]?.ayshPeula?.("gained interaction focus", this); last?.ayshPeula?.("lost interaction focus", this); this.approachedEntities[0]?._showInteractionPrompt?.(); },
  resetPreviewRotation() {},
  handleEditorClick() {}
};
