// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ManualGeometryBuilder.js
 * @description Merges radial lofts and tapered limbs into one indexed manual mesh.
 * The Awtsmoos renews many anatomical parts within one garment; Awtsmoos.com
 * receives smooth deterministic silhouettes without multiplying renderer draw calls.
 */

import {
	addVector,
	averageVectors,
	crossVector,
	normalizeVector,
	scaleVector,
	subtractVector
} from './CreatureVectorMath.js';

export class ManualGeometryBuilder {
	constructor() {
		this.indices = [];
		this.vertices = [];
	}

	addLoft(profile, segments = 10) {
		const rings = profile.map((section) => this.addRing(section, segments));
		for (let ring = 0; ring < rings.length - 1; ring += 1) {
			this.connectRings(rings[ring], rings[ring + 1]);
		}
		this.capRing(rings[0], true);
		this.capRing(rings.at(-1), false);
		return this;
	}

	addLimb(start, end, startRadius, endRadius, segments = 8) {
		const axis = normalizeVector(subtractVector(end, start));
		const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
		const tangent = normalizeVector(crossVector(axis, helper));
		const bitangent = normalizeVector(crossVector(axis, tangent));
		const first = this.addOrientedRing(start, startRadius, tangent, bitangent, segments);
		const second = this.addOrientedRing(end, endRadius, tangent, bitangent, segments);
		this.connectRings(first, second);
		this.capRing(first, true);
		this.capRing(second, false);
		return this;
	}

	addRing(section, segments) {
		const indices = [];
		for (let segment = 0; segment < segments; segment += 1) {
			const angle = segment / segments * Math.PI * 2;
			indices.push(this.vertex([
				section.x,
				section.y + Math.cos(angle) * section.radiusY,
				section.z + Math.sin(angle) * section.radiusZ
			]));
		}
		return indices;
	}

	addOrientedRing(center, radius, tangent, bitangent, segments) {
		const indices = [];
		for (let segment = 0; segment < segments; segment += 1) {
			const angle = segment / segments * Math.PI * 2;
			const offset = addVector(
				scaleVector(tangent, Math.cos(angle) * radius),
				scaleVector(bitangent, Math.sin(angle) * radius)
			);
			indices.push(this.vertex(addVector(center, offset)));
		}
		return indices;
	}

	connectRings(first, second) {
		for (let index = 0; index < first.length; index += 1) {
			const next = (index + 1) % first.length;
			this.indices.push(first[index], second[index], second[next]);
			this.indices.push(first[index], second[next], first[next]);
		}
	}

	capRing(ring, reverse) {
		const centerIndex = this.vertex(averageVectors(
			ring.map((index) => this.vertices[index])
		));
		for (let index = 0; index < ring.length; index += 1) {
			const next = (index + 1) % ring.length;
			this.indices.push(...(reverse
				? [centerIndex, ring[next], ring[index]]
				: [centerIndex, ring[index], ring[next]]));
		}
	}

	vertex(point) {
		this.vertices.push(point);
		return this.vertices.length - 1;
	}

	build() {
		return {
			indices: [...this.indices],
			vertices: this.vertices.map((point) => [...point])
		};
	}
}
