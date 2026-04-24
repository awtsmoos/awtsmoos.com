
// B"H
import Chai from "../../chayim/chai/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * Vehicle (Merkavah)
 * A vessel that carries a soul.
 */
export default class Vehicle extends Chai {
    type = "vehicle";
    driver = null;
    isVehicle = true;
    seatOffset = new THREE.Vector3(0, 0.5, 0); // Where the player sits relative to vehicle center

    constructor(op, olam) {
        // Vehicles are solid by default and interactable
        op.isSolid = true;
        op.interactable = true;
        super(op, olam);
        this.speed = 0;
        this.maxSpeed = 50;
        
        // Listen for interaction to Mount
        this.on("accepted interaction", (player) => {
            if (!this.driver) {
                this.mount(player);
            }
        });
    }

    mount(player) {
        this.driver = player;
        
        // 1. Disable Player Physics/Control
        player.isDriving = true;
        player.drivingVehicle = this;
        player.mesh.visible = true; // Keep visible, but attached
        
        // 2. Disable Player Gravity/Collision (Vehicle handles it)
        player.velocity.set(0,0,0);
        
        // 3. Switch Camera Target
        if (this.olam.ayin) {
            this.olam.ayin.target = this;
            this.olam.ayin.desiredDistance = 10;
        }

        // 4. Parenting (Visual Attachment)
        // We don't actually reparent the ThreeJS mesh to avoid world-matrix complications with the Octree,
        // instead we sync the position in heesHawvoos.
        
        this.ayshPeula("ui event", "effectsOverlay", { text: "Mounted " + this.name, color: "#00ff00" });
    }

    dismount() {
        if (!this.driver) return;

        const player = this.driver;
        player.isDriving = false;
        player.drivingVehicle = null;
        
        // Eject player slightly up and to side
        const exitPos = this.mesh.position.clone().add(new THREE.Vector3(2, 2, 0).applyQuaternion(this.mesh.quaternion));
        player.setPosition(exitPos);
        player.velocity.set(0, 5, 0); // Small hop

        // Reset Camera
        if (this.olam.ayin) {
            this.olam.ayin.target = player;
        }

        this.driver = null;
        this.speed = 0;
    }

    heesHawvoos(dt) {
        // 1. Handle Input if Driver exists
        if (this.driver) {
            this.handleInput(dt);
        } else {
            // Friction/Deceleration when empty
            this.speed *= 0.95;
            if(Math.abs(this.speed) < 0.1) this.speed = 0;
        }

        // 2. Physics Movement (Subclasses implement applyPhysics)
        this.applyPhysics(dt);

        // 3. Sync Driver Position
        if (this.driver) {
            this.syncDriver();
        }

        // 4. Base Updates
        super.heesHawvoos(dt);
    }

    syncDriver() {
        if(!this.driver || !this.mesh) return;
        
        // Calculate seat position in world space
        const seatPos = this.seatOffset.clone().applyQuaternion(this.mesh.quaternion).add(this.mesh.position);
        
        this.driver.setPosition(seatPos);
        this.driver.rotation.y = this.mesh.rotation.y;
        this.driver.mesh.rotation.copy(this.mesh.rotation);
        
        // Animation: Sit
        if(this.driver.playChaweeyoos) {
             // If we had a sit animation, we'd play it. For now, idle.
             this.driver.playChaweeyoos("idle");
        }
    }

    handleInput(dt) {
        // Default implementation (can be overridden)
        const inputs = this.olam.inputs;
        
        if (inputs.FORWARD) {
            this.speed = Math.min(this.maxSpeed, this.speed + 30 * dt);
        } else if (inputs.BACKWARD) {
            this.speed = Math.max(-this.maxSpeed / 2, this.speed - 30 * dt);
        } else {
            this.speed *= 0.98; // Rolling friction
        }

        if (Math.abs(this.speed) > 0.5) {
            const turnSpeed = 2.0 * (this.speed / this.maxSpeed);
            if (inputs.LEFT_ROTATE) this.rotation.y += turnSpeed * dt;
            if (inputs.RIGHT_ROTATE) this.rotation.y -= turnSpeed * dt;
        }
    }

    applyPhysics(dt) {
        // Basic ground movement
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        this.velocity.x = forward.x * this.speed;
        this.velocity.z = forward.z * this.speed;
    }
}
