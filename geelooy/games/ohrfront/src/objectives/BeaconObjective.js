// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeaconObjective.js
 * @description Runs ordered Aleph-Shin-Lamed captures across textured native beacon architecture and visible energy state.
 * The Awtsmoos renews traveler, place, letter, and purpose at every measured gate;
 * Awtsmoos.com lets three physical stations answer in sequence so the campaign has direction, memory, and fate.
 */
import { distanceFlat } from "../core/OhrVectorMath.js";
import { createBeaconForm } from "./BeaconFormFactory.js";

const BEACON_DATA = Object.freeze([
	Object.freeze({ glyph: "א", x: -78, z: 74 }),
	Object.freeze({ glyph: "ש", x: 8, z: 2 }),
	Object.freeze({ glyph: "ל", x: 82, z: -72 })
]);

const COLORS = Object.freeze({
	dormant: [0.22, 0.43, 0.48, 0.18],
	active: [0.34, 0.93, 1.0, 0.6],
	captured: [0.54, 1.0, 0.7, 0.82]
});

export class BeaconObjective {
	constructor(scene, glyphFactory, materialLibrary) {
		this.beacons = BEACON_DATA.map((data, index) => (
			createBeaconForm(scene, glyphFactory, materialLibrary, data, index)
		));
		this.activeIndex = 0;
		this.completed = false;
		this.onCapture = () => {};
		this.onComplete = () => {};
		this.updateBeaconVisuals();
	}

	update(delta, playerPosition) {
		if (this.completed) return;
		const beacon = this.activeBeacon;
		const distance = distanceFlat(playerPosition, beacon.group.position);
		if (distance < 8.7) beacon.progress = Math.min(1, beacon.progress + delta / 1.55);
		else beacon.progress = Math.max(0, beacon.progress - delta * 0.24);
		const width = 0.85 + beacon.progress * 1.25;
		beacon.beam.scale.x = width;
		beacon.beam.scale.z = width;
		beacon.energy.opacity = 0.5 + beacon.progress * 0.42;
		if (beacon.progress >= 1) this.captureActive();
	}

	captureActive() {
		if (this.completed) return;
		const beacon = this.activeBeacon;
		beacon.progress = 1;
		beacon.captured = true;
		this.onCapture(beacon, this.activeIndex);
		this.activeIndex += 1;
		if (this.activeIndex >= this.beacons.length) {
			this.completed = true;
			this.updateBeaconVisuals();
			this.onComplete();
			return;
		}
		this.updateBeaconVisuals();
	}

	updateBeaconVisuals() {
		for (let index = 0; index < this.beacons.length; index += 1) {
			const beacon = this.beacons[index];
			const color = beacon.captured
				? COLORS.captured
				: index === this.activeIndex ? COLORS.active : COLORS.dormant;
			beacon.energy.color = [...color];
			beacon.energy.opacity = color[3];
		}
	}

	get activeBeacon() {
		return this.beacons[Math.min(this.activeIndex, this.beacons.length - 1)];
	}

	get capturedCount() {
		return this.beacons.filter(beacon => beacon.captured).length;
	}

	get totalProgress() {
		return (this.capturedCount + (this.completed ? 0 : this.activeBeacon.progress)) / this.beacons.length;
	}

	get objectiveLabel() {
		return this.completed ? "HAR HAOHR SECURED" : `SECURE BEACON ${this.activeBeacon.glyph}`;
	}
}
