// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeaconObjective.js
 * @description Manifests three capture beacons and advances the Har HaOhr campaign objective from player proximity.
 * The Awtsmoos renews traveler, place, and purpose every instant; Awtsmoos.com gives that meeting a finite beacon
 * whose ring fills with light until three separate points reveal one completed path across the battlefield.
 */

import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

const BEACON_COORDINATES = Object.freeze([
	[-72, 76],
	[8, 2],
	[82, -72]
]);

/** Three-stage capture objective for the first campaign node. */
export class BeaconObjective {
	constructor(THREE, scene) {
		this.THREE = THREE;
		this.scene = scene;
		this.beacons = BEACON_COORDINATES.map((coordinates, index) => this.createBeacon(coordinates, index));
		this.onComplete = () => {};
		this.completed = false;
	}

	createBeacon([x, z], index) {
		const group = new this.THREE.Group();
		const base = new this.THREE.Mesh(
			new this.THREE.CylinderGeometry(3.6, 4.4, 1.1, 12),
			new this.THREE.MeshStandardMaterial({ color: 0x27444d, metalness: 0.5, roughness: 0.45 })
		);
		const beamMaterial = new this.THREE.MeshBasicMaterial({ color: 0x46dff4, transparent: true, opacity: 0.34 });
		const beam = new this.THREE.Mesh(new this.THREE.CylinderGeometry(0.72, 1.3, 11, 12), beamMaterial);
		beam.position.y = 5.6;
		const ring = new this.THREE.Mesh(
			new this.THREE.TorusGeometry(5.2, 0.18, 8, 40),
			new this.THREE.MeshBasicMaterial({ color: 0x8df8ff })
		);
		ring.rotation.x = Math.PI / 2;
		ring.position.y = 0.72;
		group.add(base, beam, ring);
		group.position.set(x, sampleHarHaOhrHeight(x, z) + 0.55, z);
		group.name = `LightBeacon_${index + 1}`;
		this.scene.add(group);
		return { group, beam, ring, progress: 0, captured: false };
	}

	update(delta, playerPosition) {
		if (this.completed) return;
		for (const beacon of this.beacons) {
			if (beacon.captured) continue;
			const horizontal = playerPosition.clone().setY(0).distanceTo(beacon.group.position.clone().setY(0));
			if (horizontal < 8.5) beacon.progress = Math.min(1, beacon.progress + delta / 1.9);
			else beacon.progress = Math.max(0, beacon.progress - delta * 0.2);
			beacon.ring.scale.setScalar(1 + beacon.progress * 0.24);
			beacon.beam.material.opacity = 0.28 + beacon.progress * 0.5;
			if (beacon.progress >= 1) this.capture(beacon);
		}
		if (this.capturedCount === this.beacons.length) {
			this.completed = true;
			this.onComplete();
		}
	}

	capture(beacon) {
		beacon.captured = true;
		beacon.beam.material.color.setHex(0x8dffaf);
		beacon.ring.material.color.setHex(0xeaffc1);
	}

	get capturedCount() {
		return this.beacons.filter(beacon => beacon.captured).length;
	}
}
