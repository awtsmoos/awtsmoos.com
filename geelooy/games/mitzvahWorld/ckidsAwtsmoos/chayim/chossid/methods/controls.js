// B"H
/**
 * @file controls.js
 * @description
 * Movement and action gates. Right-click now reaches `handleClick`, so NPCs can
 * honor target-first/right-click dialogue and doors can toggle by explicit hit.
 */
const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyZ";
const CAMERA_FPS_TOGGLE = "KeyT";
const ACTION_TOGGLE = "KeyC";
const ACTION_SELECT = "Enter";
const DISMOUNT_KEY = "KeyX";
const LEFT_STRIDE_KEY = "KeyE";
const RIGHT_STRIDE_KEY = "KeyQ";

function keyOn(olam, ...codes) {
  return codes.some(code => !!olam?.keyStates?.[code]);
}

function flag(inputs, key) {
  return inputs?.[key] === true;
}

function passMouseToWorld(chossid, event = {}) {
  if (chossid.__spikeDeathControlsFrozen || chossid.__spikeDefeated) return;
  if (event.button === 2) event.preventDefault?.();
  if (event.button === 0 || event.button === 2) {
    chossid.handleClick?.(event);
  }
  if (event.button === 2) chossid.getRealActiveItemInstance?.();
}

export default {
  controls() {
    this.resetMoving();
    if (this.__spikeDeathControlsFrozen || this.__spikeDefeated) return;
    if (this.isDriving && this.drivingVehicle) {
      if (this.olam.keyStates?.[DISMOUNT_KEY]) this.drivingVehicle.dismount?.();
      return;
    }
    if (this.olam.showingImportantMessage) return;
    const inputs = this.olam.inputs || {};
    this.moving.running = inputs.RUNNING !== false || keyOn(this.olam, "ShiftLeft", "ShiftRight");
    this.moving.forward = flag(inputs, "FORWARD") || keyOn(this.olam, "KeyW", "ArrowUp");
    this.moving.backward = flag(inputs, "BACKWARD") || keyOn(this.olam, "KeyS", "ArrowDown");
    this.moving.turningLeft = flag(inputs, "LEFT_ROTATE") || keyOn(this.olam, "KeyA", "ArrowLeft");
    this.moving.turningRight = flag(inputs, "RIGHT_ROTATE") || keyOn(this.olam, "KeyD", "ArrowRight");
    this.moving.stridingLeft = flag(inputs, "LEFT_STRIDE") || keyOn(this.olam, LEFT_STRIDE_KEY);
    this.moving.stridingRight = flag(inputs, "RIGHT_STRIDE") || keyOn(this.olam, RIGHT_STRIDE_KEY);
    this.moving.jump = flag(inputs, "JUMP") || keyOn(this.olam, "Space");
    this.moving.down = flag(inputs, "DOWN") || keyOn(this.olam, "KeyX");
    this.moving.up = flag(inputs, "UP");
    this.cameraControls();
  },

  movingSounds() {},

  cameraControls() {
    if (this.olam.keyStates?.[CAMERA_PAN_UP]) this.olam.ayin?.panUp?.();
    else if (this.olam.keyStates?.[CAMERA_PAN_DOWN]) this.olam.ayin?.panDown?.();
  },

  dialogueControls(event) {
    if (!this.interactingWith) return;
    const n = Number.parseInt(event?.key, 10);
    if (n >= 1 && n <= 9) this.interactingWith.toggleToOption?.(n - 1);
  },

  setupInputListeners(olam) {
    olam.on("mousedown", event => passMouseToWorld(this, event));
    olam.on("contextmenu", event => passMouseToWorld(this, { ...event, button: 2, type: "contextmenu" }));
    olam.on("keypressed", async event => {
      if (this.__spikeDeathControlsFrozen || this.__spikeDefeated) return;
      this.ayshPeula("keypressed", event);
      this.dialogueControls(event);
      await this.handlePlatformerKey(event);
    });
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
      case "Space":
        this.olam.ayshPeula("setInput", { code: "Space" });
        setTimeout(() => this.olam.ayshPeula("setInputOut", { code: "Space" }), 80);
        break;
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

  async selectFocusedThing() {
    if (this.selected) return void this.selectMenuOption?.();
    if (this.interactingWith?.selectOption) return void await this.interactingWith.selectOption();
    if (this.intersected) return void await this.selectIntersected?.();
  },

  cycleApproachedEntities() {
    if (!Array.isArray(this.approachedEntities) || this.approachedEntities.length <= 1) return;
    const last = this.approachedEntities.shift();
    this.approachedEntities.push(last);
    this.approachedEntities[0]?.ayshPeula?.("gained interaction focus", this);
    last?.ayshPeula?.("lost interaction focus", this);
    this.approachedEntities[0]?._showInteractionPrompt?.();
  },

  resetPreviewRotation() { this.placementRotation = 0; },
  handleEditorClick() {}
};
