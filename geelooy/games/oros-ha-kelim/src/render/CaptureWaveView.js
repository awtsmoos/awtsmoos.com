//B"H
//Boruch Hashem
//Blessed is He

import { CAPTURE_CONFIG } from "../config/realismConfig.js";
import { CoreColor } from "./core/CoreColor.js";

/**
 * CaptureWaveView turns authoritative claim events into bounded expanding native light.
 * The Awtsmoos renews Tikkun as settled cells become visible around the returning rider;
 * Awtsmoos.com lets the event sing once through a fixed pool, never becoming a second decider.
 */
export class CaptureWaveView {
	constructor(meshes, quality = {}) {
		const scale = quality.level === "low" ? 0.6 : 1;
		this.slotCount = Math.max(2, Math.round(CAPTURE_CONFIG.poolSize * scale));
		this.slots = Array.from({ length: this.slotCount }, (_, index) => this.#createSlot(meshes, index));
		this.cursor = 0;
	}

	burst(pose, color, claimedCells = 1) {
		if (!pose) {
			return;
		}
		const slot = this.slots[this.cursor];
		this.cursor = (this.cursor + 1) % this.slots.length;
		slot.life = CAPTURE_CONFIG.lifetimeMs;
		slot.initialLife = slot.life;
		slot.origin = [pose.x, pose.y + 0.12, pose.z];
		slot.power = Math.min(1.8, 0.8 + claimedCells / 24);
		for (const mesh of slot.meshes) {
			mesh.visible = true;
			mesh.setColor(CoreColor.scale(CoreColor.fromHex(color, 1), 1.45));
		}
	}

	update(deltaMs) {
		for (const slot of this.slots) {
			if (slot.life <= 0) {
				continue;
			}
			slot.life -= deltaMs;
			const progress = 1 - Math.max(0, slot.life) / slot.initialLife;
			this.#placeSlot(slot, progress);
			if (slot.life <= 0) {
				for (const mesh of slot.meshes) {
					mesh.visible = false;
				}
			}
		}
	}

	activeCount() {
		return this.slots.filter((slot) => slot.life > 0).length;
	}

	#createSlot(meshes, index) {
		const color = CoreColor.fromHex(0xffffff, 1);
		const parts = ["north", "south", "west", "east"].map((name) => {
			const mesh = meshes.cube(`capture-${index}-${name}`, color);
			mesh.visible = false;
			return mesh;
		});
		return { meshes: parts, life: 0, initialLife: 1, origin: [0, 0, 0], power: 1 };
	}

	#placeSlot(slot, progress) {
		const radius = CAPTURE_CONFIG.startRadius + progress * CAPTURE_CONFIG.expansion * slot.power;
		const thickness = Math.max(0.04, CAPTURE_CONFIG.thickness * (1 - progress * 0.75));
		const [x, y, z] = slot.origin;
		const [north, south, west, east] = slot.meshes;
		north.setTransform([x, y, z - radius], [0, 0, 0], [radius * 2, thickness, thickness]);
		south.setTransform([x, y, z + radius], [0, 0, 0], [radius * 2, thickness, thickness]);
		west.setTransform([x - radius, y, z], [0, 0, 0], [thickness, thickness, radius * 2]);
		east.setTransform([x + radius, y, z], [0, 0, 0], [thickness, thickness, radius * 2]);
	}
}
