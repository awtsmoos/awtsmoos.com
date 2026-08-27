// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos draws each ring around one transported spine, so a creature's
 * body bends without frame flips. This Awtsmoos.com loft preserves the public
 * mesh contract, deterministic indices, caps, UVs, and linear complexity.
 */

import { sampleSection } from "./centerlineSampler.js";
import { createParallelTransportFrames } from "./parallelTransportFrames.js";
import { capLoftRing, connectLoftRings } from "./loftTopology.js";
import { buildVertexNormals } from "./normalBuilder.js";
import { addVector, scaleVector } from "./vectorMath.js";

function buildRing(options) {
	const ring = [];
	for (let radialIndex = 0; radialIndex < options.radialSegments; radialIndex += 1) {
		const angle = radialIndex / options.radialSegments * Math.PI * 2;
		const point = addVector(
			options.frame.center,
			addVector(
				scaleVector(options.frame.right, Math.cos(angle) * options.section.half_width),
				scaleVector(options.frame.up, Math.sin(angle) * options.section.half_height)
			)
		);
		ring.push(options.positions.length / 3);
		options.positions.push(...point);
		options.uvs.push(radialIndex / options.radialSegments, options.amount);
	}
	return ring;
}

export function buildEllipticalLoft(guide, options = {}) {
	const radialSegments = options.radial_segments || guide.radial_segments || 16;
	const longitudinalSegments = options.longitudinal_segments || guide.longitudinal_segments || 12;
	const amounts = Array.from(
		{ length: longitudinalSegments + 1 },
		(_, index) => index / longitudinalSegments
	);
	const sections = amounts.map((amount) => sampleSection(guide.sections, amount));
	const frames = createParallelTransportFrames(
		guide.centerline,
		amounts,
		sections.map((section) => section.rotation || 0)
	);
	const positions = [];
	const uvs = [];
	const indices = [];
	const rings = amounts.map((amount, index) => buildRing({
		amount,
		frame: frames[index],
		section: sections[index],
		radialSegments,
		positions,
		uvs
	}));
	connectLoftRings(rings, indices);
	if (options.cap_start === true) {
		capLoftRing(rings[0], positions, uvs, indices, true);
	}
	if (options.cap_end === true) {
		capLoftRing(rings.at(-1), positions, uvs, indices, false);
	}
	return {
		positions,
		normals: buildVertexNormals(positions, indices),
		uvs,
		indices,
		boundaries: { start: [...rings[0]], end: [...rings.at(-1)] }
	};
}
