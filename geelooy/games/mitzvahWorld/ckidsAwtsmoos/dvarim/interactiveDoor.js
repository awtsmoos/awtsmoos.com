
/**
 * B"H
 * @file interactiveDoor.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE THRESHOLD — A Bridge Between Worlds                   ║
 * ║                                                             ║
 * ║  Chapter 17: The Door That Listens                          ║
 * ║                                                             ║
 * ║  "Open for me the gates of righteousness; I will enter      ║
 * ║  through them and praise the L-rd" (Tehillim 118:19)       ║
 * ║                                                             ║
 * ║  An entity forged from wood and gold. It seals the void     ║
 * ║  of the entrance and yields only when spoken to:            ║
 * ║    - Press 'C' when near (via approachedEntities stack)     ║
 * ║    - Click directly on the door (via raycasting)            ║
 * ║                                                             ║
 * ║  The door's local geometry has its hinge at origin (0,0,0). ║
 * ║  Rotation around Y swings it open like a real gate.         ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import Tzomayach from "../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';
import GeometryManager from "../Olam/math/GeometryManager.js";

/**
 * @constant DOOR_DEFAULTS
 * @description Default door configuration values.
 */
const DOOR_DEFAULTS = {
    width: 4,
    height: 5.5,
    thickness: 0.5,
    openAngle: Math.PI * 0.55,
    lerpSpeed: 12.0, // FASTER, more "insane" response
    angleThreshold: 0.01,
    interactKey: 'C',
    proximity: 5.0 // More focused interaction range
};

/**
 * @constant DOOR_MATERIALS
 * @description Default material configuration for the door.
 */
const DOOR_MATERIALS = {
    wood: { MeshLambertMaterial: { color: "#5d4037" } }, // Lighter, richer mahogany
    knob: { MeshStandardMaterial: { color: "#FFD700", metalness: 1.0, roughness: 0.05 } }
};

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


    checkPlayerForKey(player) {
        if (!this.keyId) return true;
        const inv = player.inventory;
        if (!inv || !inv.slots) return false;
        return inv.slots.some(s => s && s.id === this.keyId);
    }


    /**
     * @method _setupEventHandlers
     * @description
     * Wires up all event listeners for the door.
     * Separated from constructor for modularity.
     */
    _setupEventHandlers() {
        this.on("ready", () => {
            if (this.mesh) this.baseRotY = this.mesh.rotation.y;
        });

        this.on("nivraNeechnas", (player) => {
            if (!this.olam || player.type !== 'chossid') return;
            this._showInteractionPrompt();
        });

        this.on("nivraYotsee", (player) => {
            if (!this.olam || player.type !== 'chossid') return;
            this._hideInteractionPrompt();
        });

        this.on("accepted interaction", (player) => {
            // B"H: Distance check using absolute world coordinates!
            if (player && player.mesh && this.mesh) {
                // Force matrices to be absolutely true to the physical world
                this.mesh.updateMatrixWorld(true);
                player.mesh.updateMatrixWorld(true);

                const doorWorldPos = new THREE.Vector3();
                this.mesh.getWorldPosition(doorWorldPos);
                
                const playerWorldPos = new THREE.Vector3();
                player.mesh.getWorldPosition(playerWorldPos);
                
                const dist = playerWorldPos.distanceTo(doorWorldPos);
                
                // B"H: Give a massive interaction allowance
                if (dist > (this.proximity || 80.0)) { 
                    this.olam.ayshPeula("ui event", "toast", { message: "B\"H! Too far away to interact with door. Distance: " + Math.round(dist), type: "error" });
                    return;
                }
            }

            if (this.isLocked && !this.isOpen) {
                if (this.checkPlayerForKey(player)) {
                    this.isLocked = false;
                    this.olam.ayshPeula("ui event", "effectsOverlay", { text: "UNLOCKED!", color: "#ffd700" });
                    this.toggleDoor();
                } else {
                    this.olam.ayshPeula("ui event", "effectsOverlay", { text: "LOCKED (Requires Key)", color: "#ff0000" });
                    return;
                }
            } else {
                this.toggleDoor();
            }
            this._showInteractionPrompt();
        });

        // B"H: Proximity/Hover Radiance & Tooltip
        this.on("highlight", (state) => {
            this._highlight(state);
            if (state) {
                this.olam.ayshPeula("set cursor", "pointer");
                this.olam.ayshPeula("ui event", "tooltip", { show: true, text: this.isOpen ? "Close Door" : "Open Door" });
            } else {
                this.olam.ayshPeula("set cursor", "default");
                this.olam.ayshPeula("ui event", "tooltip", { show: false });
            }
        });

        // B"H: Allow clicking directly
        this.on("pointerdown", () => {
            this.emit("accepted interaction", this.olam.chossid);
        });
    }

    _highlight(state) {
        if (!this.mesh) return;
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                    if (mat.emissive) {
                        if (state) {
                            if (mat.userData.oldEmissive === undefined) {
                                mat.userData.oldEmissive = mat.emissive.clone();
                            }
                            mat.emissive.setHex(0x333311);
                        } else {
                            if (mat.userData.oldEmissive !== undefined) {
                                mat.emissive.copy(mat.userData.oldEmissive);
                            }
                        }
                    }
                });
            }
        });
    }




    /**
     * @method _showInteractionPrompt
     * @description Shows the HUD overlay with the interaction key hint.
     */
    _showInteractionPrompt() {
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            showInteraction: {
                text: `to ${this.isOpen ? 'Close' : 'Open'} the Threshold`,
                key: this.interactKey
            }
        });
    }

    /**
     * @method _hideInteractionPrompt
     * @description Hides the HUD overlay.
     */
    _hideInteractionPrompt() {
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            hideInteraction: true
        });
    }

    /**
     * @method buildGeometryManually
     * @description
     * Fallback geometry builder using the unified GeometryManager.
     * The GeometryManager routes to DoorGeometry which uses BlueprintCompiler.
     * 
     * @returns {THREE.BufferGeometry}
     */
    buildGeometryManually() {
        return GeometryManager.create(
            "DoorGeometry",
            [DOOR_DEFAULTS.width, DOOR_DEFAULTS.height, DOOR_DEFAULTS.thickness]
        ) || new THREE.BoxGeometry(
            DOOR_DEFAULTS.width, DOOR_DEFAULTS.height, DOOR_DEFAULTS.thickness
        );
    }

    /**
     * @method heescheel
     * @description
     * Initialization in the world — builds geometry if needed, positions,
     * and registers with physics systems.
     */
    async heescheel(olam) {
        this.olam = olam;
        await super.heescheel(olam);

        if (!this.mesh || !this.mesh.geometry || this.mesh.geometry.attributes.position.count < 30) {
            // B"H: silent

            const geo = this.buildGeometryManually();
            const matArray = [
                new THREE.MeshLambertMaterial({ color: "#4e342e" }),
                new THREE.MeshStandardMaterial({ color: "#FFD700", metalness: 1.0, roughness: 0.1 })
            ];

            if (this.mesh && this.mesh.parent) {
                const par = this.mesh.parent;
                par.remove(this.mesh);
                this.mesh = new THREE.Mesh(geo, matArray);
                par.add(this.mesh);
            } else {
                this.mesh = new THREE.Mesh(geo, matArray);
            }
        }

        this.mesh.name = this.name || "Interactive Gateway";
        this.mesh.nivraAwtsmoos = this;

        if (this.position) {
            this.mesh.position.copy(
                this.position.vector3 ? this.position.vector3() : this.position
            );
        }
        this.mesh.rotation.y = this.baseRotY;

        this.mesh.userData.isSolid = true;
        this.isSolid = true;

        await olam.hoyseef(this);

        /*
        if (this.olam.worldOctree) {
            this.olam.worldOctree.addObject(this.mesh);
            // B"H: silent

        }
        */

        if (this.olam.interactiveOctree) {
            this.olam.interactiveOctree.fromGraphNode(this.mesh);
        }

        this.isReady = true;
    }

    /**
     * @method toggleDoor
     * @description
     * Toggles the door between open and closed states.
     * Sets the target angle for smooth lerp animation.
     */
    toggleDoor() {
        this.isOpen = !this.isOpen;
        this.targetAngle = this.isOpen ? DOOR_DEFAULTS.openAngle : 0;
        this._isMoving = true;

        if (typeof this.playSound === 'function') {
            this.playSound("awtsmoos://hit_floor", { volume: 0.3 });
        }
    }

    /**
     * @method heesHawvoos
     * @description
     * Per-frame update — smoothly lerps the door rotation toward
     * the target angle. When animation completes, re-registers
     * with physics octree for updated collision.
     * 
     * @param {number} dt - Delta time in seconds
     */
    heesHawvoos(dt) {
        super.heesHawvoos(dt);

        if (!this.mesh || !this._isMoving) return;

        const diff = this.targetAngle - this.currentAngle;

        if (Math.abs(diff) > DOOR_DEFAULTS.angleThreshold) {
            /**
             * B"H
             * The Threshold is in flux!
             * Remove from the physical grid while the utterance is changing form.
             */
            if (!this._removedFromOctree) {
                if (this.isSolid && this.olam && this.olam.worldOctree) {
                    this.olam.worldOctree.removeMesh(this.mesh);
                    this._removedFromOctree = true;
                }
            }

            this.currentAngle = THREE.MathUtils.lerp(
                this.currentAngle,
                this.targetAngle,
                dt * DOOR_DEFAULTS.lerpSpeed
            );
            this.mesh.rotation.y = this.baseRotY + this.currentAngle;
            this.mesh.updateMatrixWorld(true);
        } else {
            this.currentAngle = this.targetAngle;
            this.mesh.rotation.y = this.baseRotY + this.currentAngle;
            this.mesh.updateMatrixWorld(true);

            /**
             * B"H
             * The Threshold has solidified in its new station.
             * Re-anchor the vessel into the static earth.
             */
            if (this._removedFromOctree) {
                if (this.isSolid && this.olam && this.olam.worldOctree) {
                    this.olam.worldOctree.addObject(this.mesh);
                    this._removedFromOctree = false;
                }
            }

            this._isMoving = false;
        }
    }
}
