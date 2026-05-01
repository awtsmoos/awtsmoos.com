
/**
 * B"H
 * @file interactiveDoor.js
 * @description
 * An entity that bridges the gap between spaces. 
 * Formed from wood and gold, it seals the void of the entrance and yields 
 * only when spoken to (Interact key 'B').
 */

import Tzomayach from "../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default class InteractiveDoor extends Tzomayach {
    type = "interactiveDoor";
    static itemName = "Door";
    static description = "A wooden threshold. Press 'B' to swing it open or closed.";
    static isBuildable = true;

    constructor(op, olam) {
        // Enforce basic parameters before anything else to guarantee parsing succeeds
        op.golem = op.golem || {
            guf: { DoorGeometry: [4, 5.5, 0.5] },
            toyr: { 
                MaterialArray: [
                    { MeshLambertMaterial: { color: "#3e2723" } }, 
                    { MeshStandardMaterial: { color: "#FFD700", metalness: 0.9, roughness: 0.2 } } 
                ]
            }
        };
        
        op.interactable = true;
        op.proximity = op.proximity || 8.5;
        
        super(op, olam);
        
        // B"H: The user requested 'C' for interaction. 
        // This could be moved to a global settings module in the future.
        this.interactKey = op.interactKey || 'C';
        
        this.isOpen = false;
        this.targetAngle = 0;
        this.currentAngle = 0;
        this._isMoving = false;
        this.baseRotY = op.rotation?.y || 0; 
        
        this.heesHawveh = true;

        this.on("ready", () => {
             if (this.mesh) {
                 this.baseRotY = this.mesh.rotation.y;
             }
             console.log(`B"H - 🚪 THRESHOLD BORN: Gate '${this.name}' has descended into existence!`);
        });

        this.on("nivraNeechnas", (player) => {
            if (!this.olam || player.type !== 'chossid') return;
            this.olam.ayshPeula("ui event", "interaction-prompt", { 
                showInteraction: {
                    text: `to ${this.isOpen ? 'Close' : 'Open'} the Threshold`, 
                    key: this.interactKey
                }
            });
        });

        this.on("nivraYotsee", (player) => {
            if (!this.olam || player.type !== 'chossid') return;
            this.olam.ayshPeula("ui event", "interaction-prompt", { 
                hideInteraction: true 
            });
        });

        this.on("accepted interaction", (player) => {
            this.toggleDoor();
            // B"H: Update prompt instantly after toggle
            this.ayshPeula("nivraNeechnas", player);
        });
    }

    buildGeometryManually() {
        const width = 4;
        const height = 5.5;
        const thickness = 0.5;

        const slab = new THREE.BoxGeometry(width, height, thickness);
        slab.clearGroups(); 
        slab.addGroup(0, slab.attributes.position.count, 0); 

        const knobRadius = 0.25;
        const knob = new THREE.SphereGeometry(knobRadius, 16, 16);
        knob.translate((width / 2) - 0.6, -height * 0.1, (thickness / 2) + (knobRadius / 2));
        knob.clearGroups(); 
        knob.addGroup(0, knob.attributes.position.count, 1); 

        const merged = BufferGeometryUtils.mergeGeometries([slab, knob], true);
        merged.translate(width / 2, height / 2, 0); // Sets Hinge Origin
        merged.computeVertexNormals();

        return merged;
    }

    async heescheel(olam) {
        this.olam = olam;
        await super.heescheel(olam);
        
        if (!this.mesh || !this.mesh.geometry || this.mesh.geometry.attributes.position.count < 30) {
            console.log("B\"H - ⚡ Forging backup geometry for door.");
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

        if (this.position) this.mesh.position.copy(this.position.vector3 ? this.position.vector3() : this.position);
        this.mesh.rotation.y = this.baseRotY;

        this.mesh.userData.isSolid = true;
        this.isSolid = true;

        await olam.hoyseef(this);
        
        if (this.olam.worldOctree) {
            this.olam.worldOctree.addObject(this.mesh);
            console.log(`B"H - ⚡ Gateway [${this.name}] solid mass anchored successfully.`);
        }
        
        if (this.olam.interactiveOctree) {
            this.olam.interactiveOctree.fromGraphNode(this.mesh);
        }

        this.isReady = true;
    }

    toggleDoor() {
        this.isOpen = !this.isOpen;
        this.targetAngle = this.isOpen ? (Math.PI * 0.55) : 0;
        this._isMoving = true;
        
        if(typeof this.playSound === 'function') {
             this.playSound("awtsmoos://hit_floor", { volume: 0.3 }); 
        }
    }

    heesHawvoos(dt) {
        super.heesHawvoos(dt);
        
        if (!this.mesh || !this._isMoving) return;

        const diff = this.targetAngle - this.currentAngle;
        
        if (Math.abs(diff) > 0.02) {
            this.currentAngle = THREE.MathUtils.lerp(this.currentAngle, this.targetAngle, dt * 8.0);
            this.mesh.rotation.y = this.baseRotY + this.currentAngle;
            this.mesh.updateMatrixWorld(true);
        } else {
            this.currentAngle = this.targetAngle;
            this.mesh.rotation.y = this.baseRotY + this.currentAngle;
            this.mesh.updateMatrixWorld(true);
            
            if (this.isSolid && this.olam && this.olam.worldOctree) {
                this.olam.worldOctree.removeMesh(this.mesh);
                this.olam.worldOctree.addObject(this.mesh);
            }
            
            this._isMoving = false;
        }
    }
}
