// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpFactory.js
 * @description Owns pooled power-up slot behavior while visual craftsmanship remains in a separate generic-native factory.
 * The Awtsmoos renews each brief assistance before its form may glow beside the lane;
 * Awtsmoos.com keeps behavior simple and visuals modular so children read one clear gameplay chain.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { ChesedPowerUpVisualFactory } from "./PowerUpVisualFactory.js";

const POWERUP_TYPES = Object.freeze([
	"magnet",
	"shield",
	"double"
]);

export class ChesedPowerUpFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.visuals = new ChesedPowerUpVisualFactory(meshFactory);
	}

	/** @returns {object} Reusable slot containing all visual variants. */
	createSlot() {
		const root = new Group();
		root.name = "ProceduralPowerUpSlot";
		root.userData.kind = "powerup";
		root.userData.type = "";
		root.userData.collected = false;
		root.userData.variants = {
			magnet: this.visuals.createMagnet(),
			shield: this.visuals.createShield(),
			double: this.visuals.createDouble()
		};
		for (const variant of Object.values(root.userData.variants)) {
			variant.visible = false;
			root.add(variant);
		}
		root.visible = false;
		return root;
	}

	/**
	 * Activates one visual power-up type in a reusable slot.
	 * @param {object} slot Reusable power-up root.
	 * @param {string} type Power-up type.
	 */
	configure(slot, type) {
		const normalized = POWERUP_TYPES.includes(type)
			? type
			: "magnet";
		slot.userData.type = normalized;
		slot.userData.collected = false;
		slot.visible = true;
		for (const [variantType, variant] of Object.entries(
			slot.userData.variants
		)) {
			variant.visible = variantType === normalized;
		}
	}

	/**
	 * Spins and gently floats one active power-up.
	 * @param {object} slot Power-up root.
	 * @param {number} time Visual seconds.
	 */
	animate(slot, time) {
		const yaw = time * 2.4;
		slot.quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
		slot.position.y = 1.3
			+ Math.sin(time * 3.2) * 0.1;
	}
}
