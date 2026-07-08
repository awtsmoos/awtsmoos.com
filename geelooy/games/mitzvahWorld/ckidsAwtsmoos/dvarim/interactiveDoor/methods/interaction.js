
// B"H
/**
 * @file interaction.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE DIALOGUE OF MATTER — Interaction Logic                ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { DOOR_DEFAULTS } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

function actorPlayer(actor) {
    return actor?.player || actor?.actor || actor;
}

export default {
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

        this.on("accepted interaction", (actor) => {
            const player = actorPlayer(actor);
            if (player && player.mesh && this.mesh) {
                this.mesh.updateMatrixWorld(true);
                player.mesh.updateMatrixWorld(true);

                const doorWorldPos = new THREE.Vector3();
                this.mesh.getWorldPosition(doorWorldPos);
                
                const playerWorldPos = new THREE.Vector3();
                player.mesh.getWorldPosition(playerWorldPos);
                
                const dist = playerWorldPos.distanceTo(doorWorldPos);
                
                // B"H: The Tikkun of Proximity - give it a solid 10 units so it's not frustrating to open
                if (dist > 15.0) { 
                    this.olam.ayshPeula("ui event", "toast", { 
                        message: "B\"H! Too far away to interact with door.", 
                        type: "error" 
                    });
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

        this.on("pointerdown", () => {
            this.emit("accepted interaction", this.olam.chossid);
        });
    },

    checkPlayerForKey(player) {
        if (!this.keyId) return true;
        const inv = player.inventory;
        if (!inv || !inv.slots) return false;
        return inv.slots.some(s => s && s.id === this.keyId);
    },

    toggleDoor() {
        this.isOpen = !this.isOpen;
        this.targetAngle = this.isOpen ? DOOR_DEFAULTS.openAngle : 0;
        this._isMoving = true;

        if (typeof this.playSound === 'function') {
            this.playSound("awtsmoos://hit_floor", { volume: 0.3 });
        }
    }
};
