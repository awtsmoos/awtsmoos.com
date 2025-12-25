// B"H
/**
 * @file physics.js
 * Handles the main update loop (heesHawvoos), collision resolution, ground detection, and WATER PHYSICS.
 * Now incorporates Gematria weight into jump and gravity logic.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import ProceduralGenerators from "../../../Olam/math/ProceduralGenerators.js";
import Tzomayach from "../../tzomayach.js";

const _ground_check_ray = new THREE.Ray();
const _water_check_ray = new THREE.Ray(); 

export default {
    
    setPosition(vec3) {
        if (!vec3 || isNaN(vec3.x)) return;
        this.collider.start.set(vec3.x, vec3.y + this.height / 2, vec3.z);
        this.collider.end.set(vec3.x, vec3.y + this.height, vec3.z);
        this.collider.radius = this.radius;
        this.isTeleporting = true;
        this.velocity.set(0, 0, 0);
    },

    collisions() {
        if (!this.olam.worldOctree) return; 
        const result = this.olam.worldOctree.capsuleIntersect(this.collider);
        if (result) {
            this.collider.translate(result.normal.multiplyScalar(result.depth));
            const velocityAlongNormal = result.normal.dot(this.velocity);
            if(velocityAlongNormal < 0) {
                 this.velocity.addScaledVector(result.normal, -velocityAlongNormal);
            }
        }
    },

    heesHawvoos(dt) {
        const deltaTime = Math.min(Math.max(dt, 0.0001), 0.1);
        if (this.isTeleporting) { this.isTeleporting = false; return; }
        if (isNaN(this.mesh.position.x)) { this.setPosition(new THREE.Vector3(0, 20, 0)); return; }

        // B"H: Gematria Weight calculation
        if (this._gematriaWeight === undefined) {
            const gem = ProceduralGenerators.calculateGematria(this.name || "אדם");
            // Higher gematria = heavier. Normal is ~50-100.
            this._gematriaWeight = Math.max(0.5, Math.min(2.5, 100 / gem)); 
        }

        this.updateRayColor(); this.updateHandState(); this.updateBlockHighlight(); this.updateParticles(deltaTime);
        this.checkWaterPhysics(deltaTime);

        const steepSlopeAngle = Math.cos(THREE.MathUtils.degToRad(50));
        _ground_check_ray.origin.copy(this.collider.start);
        _ground_check_ray.direction.set(0, -1, 0);
        let groundHit = this.olam.worldOctree ? this.olam.worldOctree.rayIntersect(_ground_check_ray) : false;
        this.onFloor = groundHit && groundHit.normal.y > steepSlopeAngle && groundHit.distance <= this.radius + 0.25;

        let damping = Math.exp(-20 * deltaTime) - 1;
        if (!this.onFloor && !this.isSwimming) {
             this.velocity.y -= this.olam.GRAVITY * deltaTime;
             this.velocity.x += this.velocity.x * damping * 0.1;
             this.velocity.z += this.velocity.z * damping * 0.1;
        } else if (this.isSwimming) {
             this.velocity.addScaledVector(this.velocity, Math.exp(-3 * deltaTime) - 1);
        } else {
            this.velocity.addScaledVector(this.velocity, damping);
        }
        
        var speedDelta = deltaTime * (this.onFloor ? (this.speed * this.speedScale) : 8);
        if (!this.moving.running) speedDelta *= 0.5;

        let combinedVector = new THREE.Vector3();
        if (this.moving.forward || this.movingAutomatically) combinedVector.add(this.getForwardVector().multiplyScalar(speedDelta));
        else if (this.moving.backward) combinedVector.add(this.getForwardVector().multiplyScalar(-speedDelta));

        if (this.moving.stridingLeft) combinedVector.add(this.worldSideDirectionVector.multiplyScalar(-speedDelta));
        else if (this.moving.stridingRight) combinedVector.add(this.worldSideDirectionVector.multiplyScalar(speedDelta));

        this.velocity.x += combinedVector.x; this.velocity.z += combinedVector.z;

        // B"H: Jump height is amplified by Gematria Lightness
        if (this.onFloor && this.moving.jump && !this.isSwimming) {
            this.velocity.y = this.jumpHeight * this._gematriaWeight;
            if (!this.didJump) { this.didJump = true; this.ayshPeula("jumped", this); }
        } else if (this.didJump) this.didJump = false;

        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.collider.translate(deltaPosition);
        this.collisions();

        this.mesh.position.copy(this.collider.start);
        this.mesh.position.y -= this.radius;
        this.mesh.rotation.y = this.rotation.y;
        
        if (this.modelMesh) {
            this.modelMesh.rotation.y = this.rotation.y + this.rotateOffset;
            this.modelMesh.position.copy(this.mesh.position);
        }
        
        Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
    },

    checkWaterPhysics(dt) {
        _water_check_ray.origin.copy(this.mesh.position).setY(this.mesh.position.y + 20);
        _water_check_ray.direction.set(0, -1, 0);
        const hit = this.olam.worldOctree.rayIntersect(_water_check_ray);
        let waterLevel = -Infinity;
        if(hit && hit.object && hit.object.userData.isWater) waterLevel = hit.point.y;

        if (this.mesh.position.y < waterLevel) {
            this.inWater = true;
            const sub = Math.max(0, Math.min(1, (waterLevel - this.mesh.position.y) / this.height));
            if (sub > 0.5 && !this.isSwimming) this.isSwimming = true;
            this.velocity.y += 25.0 * sub * dt;
            this.velocity.addScaledVector(this.velocity, Math.exp(-3.0 * dt) - 1);
        } else { this.inWater = false; this.isSwimming = false; }
    }
};