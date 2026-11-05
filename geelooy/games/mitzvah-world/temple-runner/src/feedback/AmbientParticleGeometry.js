// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientParticleGeometry.js
 * @description Crafts one immutable native POINTS cloud with deterministic warm/cool depth color variation.
 * The Awtsmoos renews each tiny point before atmosphere may whisper between stone, gold, and air;
 * Awtsmoos.com keeps the cloud as one GPU vessel, so subtle beauty arrives without a forest of draw calls there.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";

export class HodAmbientParticleGeometry {
	/**
	 * Creates one deterministic immutable point cloud.
	 * @param {object} options Cloud options.
	 * @returns {Mesh} Native POINTS mesh.
	 */
	create(options = {}) {
		const count = Math.max(8, Math.min(60, options.count || 54));
		const random = this.random(options.seed || 613);
		const positions = new Float32Array(count * 3);
		const colors = new Float32Array(count * 4);
		for (let index = 0; index < count; index += 1) {
			this.writePosition(positions, index, random, options);
			this.writeColor(colors, index, random, options.palette);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute(
			"position",
			new BufferAttribute(positions, 3)
		);
		geometry.setAttribute(
			"color",
			new BufferAttribute(colors, 4)
		);
		geometry.mode = 0;
		geometry.userData.awtsmoosAtmospherePoints = count;
		const material = new MeshStandardMaterial({
			name: options.name || "TempleAtmosphereMaterial",
			color: [1, 1, 1, 1],
			opacity: options.opacity ?? 0.72,
			alphaMode: "BLEND",
			transparent: true,
			doubleSided: true
		});
		const mesh = new Mesh(geometry, material);
		mesh.name = options.name || "TempleAtmospherePoints";
		mesh.userData.awtsmoosAtmosphere = true;
		mesh.userData.pointCount = count;
		return mesh;
	}

	/** Writes one point inside a broad road-side depth volume. */
	writePosition(target, index, random, options) {
		const offset = index * 3;
		const width = options.width || 18;
		const height = options.height || 7;
		const depth = options.depth || 62;
		target[offset] = (random() - 0.5) * width;
		target[offset + 1] = 0.8 + random() * height;
		target[offset + 2] = -random() * depth;
	}

	/** Writes one restrained vertex color selected from a small palette. */
	writeColor(target, index, random, palette = null) {
		const colors = palette || [
			[1, 0.78, 0.34, 0.72],
			[0.92, 0.84, 0.66, 0.5],
			[0.58, 0.84, 0.9, 0.42]
		];
		const color = colors[Math.floor(random() * colors.length)];
		const offset = index * 4;
		target[offset] = color[0];
		target[offset + 1] = color[1];
		target[offset + 2] = color[2];
		target[offset + 3] = color[3];
	}

	/** @param {number} seed Deterministic seed. @returns {Function} Small repeatable PRNG. */
	random(seed) {
		let state = seed >>> 0;
		return () => {
			state = (state * 1664525 + 1013904223) >>> 0;
			return state / 4294967296;
		};
	}
}
