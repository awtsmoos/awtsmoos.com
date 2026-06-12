// B"H
/**
 * @file controls.js
 * @description
 * Chapter 40: the keys return to the git-rooted covenant.
 *
 * The old history was clear: W/S move along the player's own rotation, A/D turn
 * that player, and Q/E stride sideways. The Awtsmoos lets the camera witness the
 * dance without stealing the dance. Only FPS physics may bind eye-yaw to body-yaw.
 */
const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyZ";
const CAMERA_FPS_TOGGLE = "KeyT";
const ACTION_TOGGLE = "KeyC";
const ACTION_SELECT = "Enter";
const DISMOUNT_KEY = "KeyX";
const MOVE_KEYS = ["forward", "backward", "turningLeft", "turningRight", "stridingLeft", "stridingRight", "jump"];

function keyOn(olam, ...codes) { return codes.some(code => !!olam?.keyStates?.[code]); }
function flag(inputs, key) { return inputs?.[key] === true; }
function hardMovementFreeze(chossid) { return Boolean(chossid.__spikeDeathControlsFrozen || chossid.__spikeDefeated); }
function inputMap(chossid) { return chossid.olam?.inputs || {}; }
function activeMove(moving) { return MOVE_KEYS.filter(key => moving?.[key]); }
function trace(chossid, stage, payload = {}) {
  const olam = chossid.olam;
  if (!olam || globalThis.__AWTSMOOS_DEBUG__ !== true) return;
  const now = Date.now();
  olam.__movementTrace ||= [];
  olam.__movementTrace.push({ at: now, stage, ...payload });
  olam.__movementTrace = olam.__movementTrace.slice(-120);
}

export default {
  controls() {
    this.resetMoving();
    if (hardMovementFreeze(this)) return trace(this, 'hard-freeze', { frozen: true });
    if (this.isDriving && this.drivingVehicle) {
      if (this.olam.keyStates?.[DISMOUNT_KEY]) this.drivingVehicle.dismount?.();
      return;
    }

    const inputs = inputMap(this);
    this.moving.running = flag(inputs, "RUNNING") || keyOn(this.olam, "ShiftLeft", "ShiftRight");
    this.moving.forward = flag(inputs, "FORWARD") || keyOn(this.olam, "KeyW", "ArrowUp");
    this.moving.backward = flag(inputs, "BACKWARD") || keyOn(this.olam, "KeyS", "ArrowDown");
    this.moving.turningLeft = flag(inputs, "LEFT_ROTATE") || keyOn(this.olam, "KeyA", "ArrowLeft");
    this.moving.turningRight = flag(inputs, "RIGHT_ROTATE") || keyOn(this.olam, "KeyD", "ArrowRight");
    this.moving.stridingLeft = flag(inputs, "LEFT_STRIDE") || keyOn(this.olam, "KeyQ");
    this.moving.stridingRight = flag(inputs, "RIGHT_STRIDE") || keyOn(this.olam, "KeyE");
    this.moving.jump = flag(inputs, "JUMP") || keyOn(this.olam, "Space");
    this.moving.down = flag(inputs, "DOWN") || keyOn(this.olam, "KeyX");
    this.moving.up = flag(inputs, "UP");
    trace(this, 'controls-applied', { active: activeMove(this.moving) });
    this.cameraControls();
  },

  movingSounds() {},
  cameraControls() { if (this.olam.keyStates?.[CAMERA_PAN_UP]) this.olam.ayin?.panUp?.(); else if (this.olam.keyStates?.[CAMERA_PAN_DOWN]) this.olam.ayin?.panDown?.(); },
  dialogueControls(event) { if (!this.interactingWith) return; const n = Number.parseInt(event?.key, 10); if (n >= 1 && n <= 9) this.interactingWith.toggleToOption?.(n - 1); },

  setupInputListeners(olam) {
    olam.on("mousedown", event => { if (hardMovementFreeze(this)) return; if (event.button === 0) this.handleClick?.(event) || this.shoot?.(); if (event.button === 2) this.getRealActiveItemInstance?.(); });
    olam.on("keypressed", async event => { if (hardMovementFreeze(this)) return; this.ayshPeula("keypressed", event); this.dialogueControls(event); await this.handlePlatformerKey(event); });
  },

  async handlePlatformerKey(event = {}) {
    switch (event.code) {
      case "NumLock": this.movingAutomatically = !this.movingAutomatically; break;
      case DISMOUNT_KEY: if (this.isDriving && this.drivingVehicle) this.drivingVehicle.dismount?.(); break;
      case ACTION_TOGGLE: await this.activateNearbyOrTool(); break;
      case ACTION_SELECT: await this.selectFocusedThing(); break;
      case CAMERA_FPS_TOGGLE:
        if (this.olam.ayin) { this.olam.ayin.isFPS = !this.olam.ayin.isFPS; this.olam.ayshPeula("setFPS", this.olam.ayin.isFPS); }
        break;
      case "Space": this.olam.ayshPeula("setInput", { code: "Space" }); setTimeout(() => this.olam.ayshPeula("setInputOut", { code: "Space" }), 80); break;
      case "Tab": event.preventDefault?.(); this.cycleApproachedEntities(); break;
      default: break;
    }
  },

  async activateNearbyOrTool() {
    const activeItem = this.getActiveItem?.();
    if (activeItem?.isPainter) {
      this.isPaintingMode = !this.isPaintingMode;
      this.olam.ayshPeula("ui event", "effectsOverlay", { text: this.isPaintingMode ? "Painting Mode: ON" : "Painting Mode: OFF", color: this.isPaintingMode ? "#00ff00" : "#ff0000" });
      return;
    }
    const target = this.interactingWith || this.approachedEntities?.[0];
    if (target?.ayshPeula) target.ayshPeula("accepted interaction", this);
    else this.shoot?.();
  },

  async selectFocusedThing() { if (this.selected) return void this.selectMenuOption?.(); if (this.interactingWith?.selectOption) return void await this.interactingWith.selectOption(); if (this.intersected) return void await this.selectIntersected?.(); },
  cycleApproachedEntities() { if (!Array.isArray(this.approachedEntities) || this.approachedEntities.length <= 1) return; const last = this.approachedEntities.shift(); this.approachedEntities.push(last); const current = this.approachedEntities[0]; current?.ayshPeula?.("gained interaction focus", this); last?.ayshPeula?.("lost interaction focus", this); current?._showInteractionPrompt?.(); },
  resetPreviewRotation() { this.placementRotation = 0; },
  handleEditorClick() {}
};
