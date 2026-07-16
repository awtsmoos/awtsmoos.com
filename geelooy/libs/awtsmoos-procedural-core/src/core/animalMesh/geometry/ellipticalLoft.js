// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	sampleCenterline,
	sampleSection
} from "./centerlineSampler.js";
import {
	createLoftFrame
} from "./loftFrame.js";
import {
	capLoftRing,
	connectLoftRings
} from "./loftTopology.js";
import {
	buildVertexNormals
} from "./normalBuilder.js";
import {
	addVector,
	scaleVector
} from "./vectorMath.js";

export function buildEllipticalLoft(guide, options = {}) {
	const radialSegments = options.radial_segments || guide.radial_segments || 16;
	const longitudinalSegments = options.longitudinal_segments
		|| guide.longitudinal_segments
		|| 12;
	const positions = [];
	const uvs = [];
	const indices = [];
	const rings = [];

	for (let ringIndex = 0; ringIndex <= longitudinalSegments; ringIndex += 1) {
		rings.push(
			buildRing({
				guide,
				amount: ringIndex / longitudinalSegments,
				radialSegments,
				positions,
				uvs
			})
		);
	}
	connectLoftRings(rings, indices);
	if (options.cap_start === true) {
		capLoftRing(rings[0], positions, uvs, indices, true);
	}
	if (options.cap_end === true) {
		capLoftRing(rings[rings.length - 1], positions, uvs, indices, false);
	}
	return {
		positions,
		normals: buildVertexNormals(positions, indices),
		uvs,
		indices,
		boundaries: {
			start: [
				...rings[0]
			],
			end: [
				...rings[rings.length - 1]
			]
		}
	};
}

function buildRing(options) {
	const center = sampleCenterline(options.guide.centerline, options.amount);
	const section = sampleSection(options.guide.sections, options.amount);
	const frame = createLoftFrame(
		options.guide.centerline,
		options.amount,
		section.rotation || 0
	);
	const ring = [];

	for (let radialIndex = 0; radialIndex < options.radialSegments; radialIndex += 1) {
		const angle = radialIndex / options.radialSegments * Math.PI * 2;
		const point = addVector(
			center,
			addVector(
				scaleVector(frame.right, Math.cos(angle) * section.half_width),
				scaleVector(frame.up, Math.sin(angle) * section.half_height)
			)
		);
		ring.push(options.positions.length / 3);
		options.positions.push(...point);
		options.uvs.push(radialIndex / options.radialSegments, options.amount);
	}
	return ring;
}
