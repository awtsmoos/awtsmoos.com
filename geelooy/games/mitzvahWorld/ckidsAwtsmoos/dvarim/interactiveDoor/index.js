// B"H
/**
 * @file index.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE UNIFIED THRESHOLD — The Core Manifestation            ║
 * ║                                                             ║
 * ║  "This is the gate of the L-rd; the righteous shall enter"║
 * ║  (Tehillim 118:20)                                         ║
 * ║                                                             ║
 * ║  The central pillar that binds all modular emanations       ║
 * ║  of the Door into a single interactive vessel.              ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import Tzomayach from "../../chayim/tzomayach.js";
import { DOOR_DEFAULTS, DOOR_MATERIALS } from './constants.js';

// Method Fragments
import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js";

// Method Fragments
import interactionMethods from './methods/interaction.js';
import lifecycleMethods from './methods/lifecycle.js';
import graphicsMethods from './methods/graphics.js';
import uiMethods from './methods/ui.js';

export default class InteractiveDoor extends Tzomayach {
    type = "interactiveDoor";
    static itemName = "Door";
    static description = "A wooden threshold. Press 'C' or Click to swing it open or closed.";
    static isBuildable = true;

    constructor(op, olam) {
        // Enforce basic parameters before anything else
        op.golem = op.golem || {
            guf: { DoorGeometry: [DOOR_DEFAULTS.width, DOOR_DEFAULTS.height, DOOR_DEFAULTS.thickness] },
            toyr: { MaterialArray: [DOOR_MATERIALS.wood, DOOR_MATERIALS.knob] }
        };

        op.interactable = true;
        op.proximity = op.proximity || DOOR_DEFAULTS.proximity;

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

    /**
     * B"H
     * Capturing the essence of the super methods
     * so they can be invoked from the lifecycle fragments.
     */
    async _superHeescheel(olam) {
        return await super.heescheel(olam);
    }

    _superHeesHawvoos(dt) {
        return super.heesHawvoos(dt);
    }
}

// B"H - Grafting the Fragments onto the Vessel with Divine Emanation
ChasveiAwtsmoos.emanate(InteractiveDoor.prototype, [
    interactionMethods,
    lifecycleMethods,
    graphicsMethods,
    uiMethods
]);
