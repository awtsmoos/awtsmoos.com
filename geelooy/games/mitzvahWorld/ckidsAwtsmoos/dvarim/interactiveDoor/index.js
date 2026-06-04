// B"H
/**
 * @file index.js
 * @description
 * Chapter 343: The threshold is a true swinging door again.
 *
 * The Awtsmoos gives procedural houses a real door vessel, with fresh lifecycle
 * logic so an opened door is not reinserted as collision.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import { DOOR_DEFAULTS, DOOR_MATERIALS } from './constants.js';
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js";
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js?v=passable-open-door-20260603-bh343';
import graphicsMethods from './methods/graphics.js';
import uiMethods from './methods/ui.js';

export default class InteractiveDoor extends Tzomayach {
  type = "interactiveDoor";
  static itemName = "Door";
  static description = "A wooden threshold. Press C or click to swing it open or closed.";
  static isBuildable = true;

  constructor(op = {}, olam) {
    op.golem ||= {
      guf: { DoorGeometry: [DOOR_DEFAULTS.width, DOOR_DEFAULTS.height, DOOR_DEFAULTS.thickness] },
      toyr: { MaterialArray: [DOOR_MATERIALS.wood, DOOR_MATERIALS.knob] }
    };
    op.interactable = true;
    op.proximity ||= DOOR_DEFAULTS.proximity;
    super(op, olam);
    this.interactKey = op.interactKey || DOOR_DEFAULTS.interactKey;
    this.isOpen = false;
    this.isLocked = op.isLocked || false;
    this.keyId = op.keyId || null;
    this.targetAngle = 0;
    this.currentAngle = 0;
    this._isMoving = false;
    this.baseRotY = op.rotation?.y || 0;
    this.heesHawveh = true;
    this._setupEventHandlers();
  }

  async _superHeescheel(olam) { return await super.heescheel(olam); }
  _superHeesHawvoos(dt) { return super.heesHawvoos(dt); }
}

ChasveiAwtsmoos.emanate(InteractiveDoor.prototype, [interactionMethods, lifecycleMethods, graphicsMethods, uiMethods]);
