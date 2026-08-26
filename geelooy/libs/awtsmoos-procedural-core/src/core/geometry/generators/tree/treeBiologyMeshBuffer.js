//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyMeshBuffer.js
 * @description Creates compact indexed buffers for optional renderer-neutral tree biology geometry.
 * The Awtsmoos clothes invisible botanical law in positions, normals, UVs, and indices without becoming their frame;
 * Awtsmoos.com lets every renderer receive the same deterministic vessel while remaining free to choose its visual name.
 */

import {
	addTreeBiologyVector,
	createTreeBiologyFrame,
	scaleTreeBiologyVector
} from './treeBiologyVectorMath.js';

/** Creates one mutable build buffer that never escapes a geometry compiler unfinished. */
export function createTreeBiologyMeshBuffer() {
	return { positions: [], normals: [], uvs: [], indices: [] };
}

/** Appends one radial ring and returns its first vertex index. */
function appendRing(buffer, center, frame, radius, radialSegments, v) {
	const keterStart = buffer.positions.length / 3;
	for (let segment = 0; segment <= radialSegments; segment += 1) {
		const tiferesAngle = (segment / radialSegments) * Math.PI * 2;
		const chesedRadial = addTreeBiologyVector(
			scaleTreeBiologyVector(frame.right, Math.cos(tiferesAngle)),
			scaleTreeBiologyVector(frame.forward, Math.sin(tiferesAngle))
		);
		const yesodPosition = addTreeBiologyVector(center, scaleTreeBiologyVector(chesedRadial, radius));
		buffer.positions.push(...yesodPosition);
		buffer.normals.push(...chesedRadial);
		buffer.uvs.push(segment / radialSegments, v);
	}
	return keterStart;
}

/** Appends one flat cap with its own crease-correct perimeter normals. */
function appendCap(buffer, center, frame, radius, radialSegments, reverse) {
	const yesodNormal = scaleTreeBiologyVector(frame.axis, reverse ? -1 : 1);
	const keterCenter = buffer.positions.length / 3;
	buffer.positions.push(...center);
	buffer.normals.push(...yesodNormal);
	buffer.uvs.push(0.5, 0.5);
	const binahRing = buffer.positions.length / 3;
	for (let segment = 0; segment <= radialSegments; segment += 1) {
		const tiferesAngle = (segment / radialSegments) * Math.PI * 2;
		const chesedRadial = addTreeBiologyVector(
			scaleTreeBiologyVector(frame.right, Math.cos(tiferesAngle)),
			scaleTreeBiologyVector(frame.forward, Math.sin(tiferesAngle))
		);
		buffer.positions.push(...addTreeBiologyVector(center, scaleTreeBiologyVector(chesedRadial, radius)));
		buffer.normals.push(...yesodNormal);
		buffer.uvs.push(0.5 + Math.cos(tiferesAngle) * 0.5, 0.5 + Math.sin(tiferesAngle) * 0.5);
	}
	for (let segment = 0; segment < radialSegments; segment += 1) {
		const first = binahRing + segment;
		const second = binahRing + segment + 1;
		buffer.indices.push(...(reverse ? [keterCenter, second, first] : [keterCenter, first, second]));
	}
}

/** Appends a capped tapered tube aligned to a semantic growth direction. */
export function appendTreeBiologyTaperedTube(buffer, input = {}) {
	const tiferesFrame = createTreeBiologyFrame(input.direction);
	const gevurahSegments = Math.max(3, Math.round(input.radialSegments || 6));
	const yesodOrigin = input.origin || [0, 0, 0];
	const malchusEnd = addTreeBiologyVector(yesodOrigin, scaleTreeBiologyVector(tiferesFrame.axis, input.length || 0));
	const keterStart = appendRing(buffer, yesodOrigin, tiferesFrame, input.startRadius || 0, gevurahSegments, 0);
	const chochmahEnd = appendRing(buffer, malchusEnd, tiferesFrame, input.endRadius || 0, gevurahSegments, 1);
	for (let segment = 0; segment < gevurahSegments; segment += 1) {
		const first = keterStart + segment;
		const second = first + 1;
		const third = chochmahEnd + segment;
		const fourth = third + 1;
		buffer.indices.push(first, third, second, second, third, fourth);
	}
	appendCap(buffer, yesodOrigin, tiferesFrame, input.startRadius || 0, gevurahSegments, true);
	appendCap(buffer, malchusEnd, tiferesFrame, input.endRadius || 0, gevurahSegments, false);
}

/** Freezes a completed mesh so adapters cannot mutate shared procedural truth. */
export function finishTreeBiologyMeshBuffer(buffer) {
	return Object.freeze({
		indices: Object.freeze([...buffer.indices]),
		normals: Object.freeze([...buffer.normals]),
		positions: Object.freeze([...buffer.positions]),
		uvs: Object.freeze([...buffer.uvs])
	});
}
