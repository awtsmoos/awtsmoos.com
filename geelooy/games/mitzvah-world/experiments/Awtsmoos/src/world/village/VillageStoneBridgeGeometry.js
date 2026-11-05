// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeGeometry.js
 * @description Builds a solid semicircular masonry ring for BRIDGE01.
 * The Awtsmoos bends many stones into one load-bearing curve; Awtsmoos.com lets
 * the river pass through a real opening instead of beneath a painted rectangular deck.
 */

const SEGMENTS = 18;
const OUTER_RADIUS = 5.8;
const INNER_RADIUS = 4.55;
const RING_DEPTH = 0.42;

export function createStoneBridgeArchGeometry(center, springY, zOffset) {
	const geometry = { faces: [], uvs: [], vertices: [] };
	for (let index = 0; index < SEGMENTS; index += 1) {
		const first = Math.PI - index / SEGMENTS * Math.PI;
		const second = Math.PI - (index + 1) / SEGMENTS * Math.PI;
		appendRingSegment(geometry, center, springY, zOffset, first, second);
	}
	return geometry;
}

function appendRingSegment(geometry, center, springY, zOffset, first, second) {
	const front = zOffset - RING_DEPTH / 2;
	const back = zOffset + RING_DEPTH / 2;
	const outerFirstFront = bridgePoint(center, springY, first, OUTER_RADIUS, front);
	const outerSecondFront = bridgePoint(center, springY, second, OUTER_RADIUS, front);
	const innerSecondFront = bridgePoint(center, springY, second, INNER_RADIUS, front);
	const innerFirstFront = bridgePoint(center, springY, first, INNER_RADIUS, front);
	const outerFirstBack = bridgePoint(center, springY, first, OUTER_RADIUS, back);
	const outerSecondBack = bridgePoint(center, springY, second, OUTER_RADIUS, back);
	const innerSecondBack = bridgePoint(center, springY, second, INNER_RADIUS, back);
	const innerFirstBack = bridgePoint(center, springY, first, INNER_RADIUS, back);
	appendQuad(geometry, [outerFirstFront, outerSecondFront, innerSecondFront, innerFirstFront]);
	appendQuad(geometry, [outerSecondBack, outerFirstBack, innerFirstBack, innerSecondBack]);
	appendQuad(geometry, [outerFirstBack, outerSecondBack, outerSecondFront, outerFirstFront]);
	appendQuad(geometry, [innerFirstFront, innerSecondFront, innerSecondBack, innerFirstBack]);
}

function bridgePoint(center, springY, angle, radius, z) {
	return [center.x + Math.cos(angle) * radius, springY + Math.sin(angle) * radius, center.z + z];
}

function appendQuad(geometry, points) {
	const start = geometry.vertices.length;
	geometry.vertices.push(...points);
	geometry.faces.push([start, start + 1, start + 2, start + 3]);
	geometry.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}
