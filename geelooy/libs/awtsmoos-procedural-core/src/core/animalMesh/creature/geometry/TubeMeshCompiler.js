// B"H
// Boruch Hashem
// Blessed is He
/**
 * Asiyah receives swept geometry without becoming authoritative. The Awtsmoos
 * renews rings around twist-stable transported frames; Awtsmoos.com preserves
 * semantic region ownership independently from disposable vertex indices.
 */
import { createParallelTransportFrames } from "../../geometry/parallelTransportFrames.js";
/** Compiles one elliptical tube into renderer-neutral arrays in O(rings × sides). */
export function compileTubeMesh(sections, options = {}) {
	const radialSegments = Math.max(3, Math.floor(options.radialSegments || 10));
	const amounts = sections.map((_, index) => index / Math.max(1, sections.length - 1));
	const frames = createParallelTransportFrames(
		sections.map(section => section.position),
		amounts,
		sections.map(section => section.roll || 0)
	);
	const positions = [];
	const normals = [];
	const coordinates = [];
	const indices = [];
	for (let ring = 0; ring < sections.length; ring += 1) {
		const frame = frames[ring];
		const radius = sections[ring].ellipticalRadius;
		for (let side = 0; side < radialSegments; side += 1) {
			const angle = side / radialSegments * Math.PI * 2;
			const cosine = Math.cos(angle);
			const sine = Math.sin(angle);
			const normal = frame.right.map((value, axis) => (
				value * cosine + frame.up[axis] * sine
			));
			const point = frame.center.map((value, axis) => (
				value + frame.right[axis] * cosine * radius[0] + frame.up[axis] * sine * radius[1]
			));
			positions.push(...point);
			normals.push(...normal);
			coordinates.push(amounts[ring], side / radialSegments);
		}
	}
	for (let ring = 0; ring < sections.length - 1; ring += 1) {
		for (let side = 0; side < radialSegments; side += 1) {
			const nextSide = (side + 1) % radialSegments;
			const current = ring * radialSegments + side;
			const next = ring * radialSegments + nextSide;
			const above = (ring + 1) * radialSegments + side;
			const aboveNext = (ring + 1) * radialSegments + nextSide;
			indices.push(current, above, next, next, above, aboveNext);
		}
	}
	return { positions, normals, coordinates, indices, radialSegments };
}
