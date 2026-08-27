// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberFirstPersonController.js
 * @description Owns pointer-lock look, grounded FPS movement, jumping, shields, and player vitality.
 * The Awtsmoos renews the mover and the path in one instant; Awtsmoos.com lets Medaber motion become a finite
 * first-person vessel whose feet answer the same Har HaOhr terrain law seen by the renderer and read by the bots.
 */

import {
	clampToHarHaOhr,
	sampleHarHaOhrHeight
} from "../world/TerrainHeightField.js";

/** First-person controller grounded on the deterministic campaign terrain. */
export class MedaberFirstPersonController {
	constructor(THREE, camera, collisionWorld) {
		this.THREE = THREE;
		this.camera = camera;
		this.collisionWorld = collisionWorld;
		this.position = new THREE.Vector3(0, 0, 126);
		this.velocityY = 0;
		this.keys = new Set();
		this.yaw = 0;
		this.pitch = -0.08;
		this.health = 100;
		this.shield = 100;
		this.lastDamageAt = -99;
		this.movementIntensity = 0;
		this.bindInput();
		this.snapToGround();
	}

	bindInput() {
		document.addEventListener("keydown", event => {
			this.keys.add(event.code);
			if (event.code === "Space" && this.isGrounded()) this.velocityY = 8.4;
		});
		document.addEventListener("keyup", event => this.keys.delete(event.code));
		document.addEventListener("mousemove", event => {
			if (document.pointerLockElement !== document.body) return;
			this.yaw -= event.movementX * 0.0022;
			this.pitch -= event.movementY * 0.0022;
			this.pitch = Math.max(-1.42, Math.min(1.42, this.pitch));
		});
	}

	update(delta, elapsed) {
		const forwardInput = Number(this.keys.has("KeyW")) - Number(this.keys.has("KeyS"));
		const strafeInput = Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA"));
		const speed = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") ? 15 : 9;
		const forward = new this.THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
		const right = new this.THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
		const movement = forward.multiplyScalar(forwardInput).add(right.multiplyScalar(strafeInput));
		this.movementIntensity = Math.min(1, movement.length());
		if (movement.lengthSq() > 0) movement.normalize().multiplyScalar(speed * delta);
		this.position.add(movement);
		this.position.x = clampToHarHaOhr(this.position.x);
		this.position.z = clampToHarHaOhr(this.position.z);
		this.velocityY -= 23 * delta;
		this.position.y += this.velocityY * delta;
		const groundEyeY = sampleHarHaOhrHeight(this.position.x, this.position.z) + 1.72;
		if (this.position.y <= groundEyeY) {
			this.position.y = groundEyeY;
			this.velocityY = Math.max(0, this.velocityY);
		}
		this.collisionWorld.resolveHorizontal(this.position, 0.72);
		this.camera.position.copy(this.position);
		this.camera.rotation.order = "YXZ";
		this.camera.rotation.set(this.pitch, this.yaw, 0);
		if (elapsed - this.lastDamageAt > 4 && this.shield < 100) this.shield = Math.min(100, this.shield + 18 * delta);
	}

	isGrounded() {
		const ground = sampleHarHaOhrHeight(this.position.x, this.position.z) + 1.72;
		return this.position.y <= ground + 0.04 && this.velocityY <= 0.1;
	}

	snapToGround() {
		this.position.y = sampleHarHaOhrHeight(this.position.x, this.position.z) + 1.72;
		this.camera.position.copy(this.position);
	}

	takeDamage(amount, elapsed) {
		this.lastDamageAt = elapsed;
		const shieldDamage = Math.min(this.shield, amount);
		this.shield -= shieldDamage;
		this.health = Math.max(0, this.health - (amount - shieldDamage));
	}

	reset() {
		this.health = 100;
		this.shield = 100;
		this.position.set(0, 0, 126);
		this.snapToGround();
	}
}
