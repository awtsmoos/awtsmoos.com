// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberFirstPersonController.js
 * @description Owns native first-person look, terrain-grounded locomotion, jumping, collision, and vitality delegation.
 * The Awtsmoos renews mover and mountain together each instant in sight;
 * Awtsmoos.com lets motion answer terrain and cover while the core-native camera carries the player's light.
 */
import {
	addScaled,
	forwardFromAngles,
	length,
	lengthSquared,
	normalize,
	rightFromYaw,
	setEulerQuaternion,
	vector
} from "../core/OhrVectorMath.js";
import {
	clampToHarHaOhr,
	sampleHarHaOhrHeight
} from "../world/TerrainHeightField.js";
import { PlayerMotionState } from "./PlayerMotionState.js";
import { PlayerVitality } from "./PlayerVitality.js";

export class MedaberFirstPersonController {
	constructor(camera, collisionWorld) {
		this.camera = camera;
		this.collisionWorld = collisionWorld;
		this.position = vector(0, 0, 134);
		this.motion = new PlayerMotionState();
		this.vitality = new PlayerVitality();
		this.verticalVelocity = 0;
		this.keys = new Set();
		this.yaw = 0;
		this.pitch = -0.06;
		this.bindInput();
		this.snapToGround();
	}

	bindInput() {
		document.addEventListener("keydown", event => {
			this.keys.add(event.code);
			if (event.code === "Space" && this.isGrounded()) this.verticalVelocity = 8.8;
			if (event.code === "KeyC" && this.motion.isSprinting) this.motion.beginSlide(this.motion.velocity);
		});
		document.addEventListener("keyup", event => this.keys.delete(event.code));
		document.addEventListener("mousemove", event => {
			if (document.pointerLockElement !== document.body) return;
			this.yaw -= event.movementX * 0.00215;
			this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - event.movementY * 0.00215));
		});
	}

	update(delta, elapsed) {
		const forwardInput = Number(this.keys.has("KeyW")) - Number(this.keys.has("KeyS"));
		const strafeInput = Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA"));
		const move = vector();
		addScaled(move, forwardFromAngles(this.yaw), forwardInput);
		addScaled(move, rightFromYaw(this.yaw), strafeInput);
		if (lengthSquared(move) > 1) normalize(move, move);
		const wantsCrouch = this.keys.has("KeyC") || this.keys.has("ControlLeft");
		const wantsSprint = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
		const velocity = this.motion.update(delta, move, wantsSprint, wantsCrouch);
		addScaled(this.position, velocity, delta);
		this.applyVerticalMotion(delta);
		this.collisionWorld.resolveHorizontal(this.position, 0.72);
		this.camera.position.copy(this.position);
		setEulerQuaternion(this.camera.quaternion, this.pitch, this.yaw, 0);
		this.vitality.update(delta, elapsed);
	}

	applyVerticalMotion(delta) {
		this.position.x = clampToHarHaOhr(this.position.x);
		this.position.z = clampToHarHaOhr(this.position.z);
		this.verticalVelocity -= 24 * delta;
		this.position.y += this.verticalVelocity * delta;
		const eyeHeight = 1.72 - this.motion.crouch * 0.54;
		const groundEye = sampleHarHaOhrHeight(this.position.x, this.position.z) + eyeHeight;
		if (this.position.y <= groundEye) {
			this.position.y = groundEye;
			this.verticalVelocity = Math.max(0, this.verticalVelocity);
		}
	}

	isGrounded() {
		const eyeHeight = 1.72 - this.motion.crouch * 0.54;
		return this.position.y <= sampleHarHaOhrHeight(this.position.x, this.position.z) + eyeHeight + 0.08;
	}

	takeDamage(amount, elapsed, source = null) {
		this.vitality.takeDamage(amount, elapsed, source);
	}

	snapToGround() {
		this.position.y = sampleHarHaOhrHeight(this.position.x, this.position.z) + 1.72;
		this.camera.position.copy(this.position);
		setEulerQuaternion(this.camera.quaternion, this.pitch, this.yaw, 0);
	}

	reset() {
		this.vitality.reset();
		this.position.set(0, 0, 134);
		this.motion.reset();
		this.verticalVelocity = 0;
		this.snapToGround();
	}

	get health() { return this.vitality.health; }
	get shield() { return this.vitality.shield; }
	get onDamage() { return this.vitality.onDamage; }
	set onDamage(handler) { this.vitality.onDamage = handler; }
	get movementIntensity() { return Math.min(1, length(this.motion.velocity) / 10); }
}
