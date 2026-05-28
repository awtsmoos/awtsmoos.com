// B"H
/**
 * @file controls.js
 * @description
 * Chapter 5: Platformer-safe Chossid controls.
 *
 * The clean desert ladder does not need the old building preview, editor,
 * combat, shop, or NPC dialogue command web. This file keeps movement,
 * camera toggles, interaction with simple doors, and harmless bag/tool clicks.
 */

const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyZ";
const CAMERA_FPS_TOGGLE = "KeyT";
const ACTION_TOGGLE = "KeyC";
const ACTION_SELECT = "Enter";
const DISMOUNT_KEY = "KeyX";

export default {
  /** Copies input state into movement flags every frame. */
  controls() {
    if (this.isDriving && this.drivingVehicle) {
      if (this.olam.keyStates?.[DISMOUNT_KEY]) this.drivingVehicle.dismount?.();
      return;
    }

    this.resetMoving();
    if (this.olam.showingImportantMessage) return;

    const inputs = this.olam.inputs || {};
    this.moving.running = !!inputs.RUNNING;
    this.moving.forward = !!inputs.FORWARD;
    this.moving.backward = !!inputs.BACKWARD;
    this.moving.down = !!inputs.DOWN;
    this.moving.up = !!inputs.UP;
    this.moving.turningLeft = !!inputs.LEFT_ROTATE;
    this.moving.turningRight = !!inputs.RIGHT_ROTATE;
    this.moving.stridingLeft = !!inputs.LEFT_STRIDE;
    this.moving.stridingRight = !!inputs.RIGHT_STRIDE;
    this.moving.jump = !!inputs.JUMP;

    this.cameraControls();
  },

  /** Kept for compatibility; the light platformer has no footstep audio here. */
  movingSounds() {},

  /** Simple camera pan keys. */
  cameraControls() {
    if (this.olam.keyStates?.[CAMERA_PAN_UP]) this.olam.ayin?.panUp?.();
    else if (this.olam.keyStates?.[CAMERA_PAN_DOWN]) this.olam.ayin?.panDown?.();
  },

  /** Old dialogue numeric controls are inert when no dialogue exists. */
  dialogueControls(event) {
    if (!this.interactingWith) return;
    const n = Number.parseInt(event?.key, 10);
    if (n >= 1 && n <= 9) this.interactingWith.toggleToOption?.(n - 1);
  },

  /** Installs only safe mouse/key listeners. */
  setupInputListeners(olam) {
    olam.on("mousedown", event => {
      if (event.button === 0) this.handleClick?.(event) || this.shoot?.();
      if (event.button === 2) this.getRealActiveItemInstance?.();
    });

    olam.on("keypressed", async event => {
      this.ayshPeula("keypressed", event);
      this.dialogueControls(event);
      await this.handlePlatformerKey(event);
    });
  },

  /** Routes platformer-safe key commands. */
  async handlePlatformerKey(event = {}) {
    switch (event.code) {
      case "NumLock":
        this.movingAutomatically = !this.movingAutomatically;
        break;
      case "KeyQ":
        this.resetPreviewRotation?.();
        break;
      case DISMOUNT_KEY:
        if (this.isDriving && this.drivingVehicle) this.drivingVehicle.dismount?.();
        break;
      case ACTION_TOGGLE:
        await this.activateNearbyOrTool();
        break;
      case ACTION_SELECT:
        await this.selectFocusedThing();
        break;
      case CAMERA_FPS_TOGGLE:
        if (this.olam.ayin) {
          this.olam.ayin.isFPS = !this.olam.ayin.isFPS;
          this.olam.ayshPeula("setFPS", this.olam.ayin.isFPS);
        }
        break;
      case "Space":
        this.olam.ayshPeula("setInput", { code: "Space" });
        setTimeout(() => this.olam.ayshPeula("setInputOut", { code: "Space" }), 50);
        break;
      case "Tab":
        event.preventDefault?.();
        this.cycleApproachedEntities();
        break;
      default:
        break;
    }
  },

  /** Uses a nearby simple interactable or a harmless selected tool. */
  async activateNearbyOrTool() {
    const activeItem = this.getActiveItem?.();
    if (activeItem?.isPainter) {
      this.isPaintingMode = !this.isPaintingMode;
      this.olam.ayshPeula("ui event", "effectsOverlay", {
        text: this.isPaintingMode ? "Painting Mode: ON" : "Painting Mode: OFF",
        color: this.isPaintingMode ? "#00ff00" : "#ff0000"
      });
      return;
    }

    const target = this.interactingWith || this.approachedEntities?.[0];
    if (target?.ayshPeula) target.ayshPeula("accepted interaction", this);
    else this.shoot?.();
  },

  /** Selects a focused dialogue/object only if that legacy focus exists. */
  async selectFocusedThing() {
    if (this.selected) return void this.selectMenuOption?.();
    if (this.interactingWith?.selectOption) return void await this.interactingWith.selectOption();
    if (this.intersected) return void await this.selectIntersected?.();
  },

  /** Rotates focus through simple interactables. */
  cycleApproachedEntities() {
    if (!Array.isArray(this.approachedEntities) || this.approachedEntities.length <= 1) return;
    const last = this.approachedEntities.shift();
    this.approachedEntities.push(last);
    const current = this.approachedEntities[0];
    current?.ayshPeula?.("gained interaction focus", this);
    last?.ayshPeula?.("lost interaction focus", this);
    current?._showInteractionPrompt?.();
  },

  /** Compatibility no-op for removed building preview rotation. */
  resetPreviewRotation() {
    this.placementRotation = 0;
  },

  /** Compatibility no-op for removed visual editor. */
  handleEditorClick() {}
};
