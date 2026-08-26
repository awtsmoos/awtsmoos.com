//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeRootGeometry.js
 * @description Manifests existing deterministic root descriptors as one bounded renderer-neutral mesh.
 * The Awtsmoos renews what lies beneath the soil though ordinary sight may call it hidden ground;
 * Awtsmoos.com lets each semantic root receive geometry while its stable descriptor ID remains found.
 */

import {
	appendTreeBiologyTaperedTube,
	createTreeBiologyMeshBuffer,
	finishTreeBiologyMeshBuffer
} from './treeBiologyMeshBuffer.js';
import { treeBiologyNumber } from './treeBiologyVectorMath.js';

/** Clamps an integer geometry budget into a safe deterministic range. */
function boundedInteger(value, fallback, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Math.round(treeBiologyNumber(value, fallback))));
}

/** Creates one immutable root geometry bundle from the canonical root report. */
export function createTreeRootGeometry(rootReport = {}, options = {}) {
	const keterRoots = Array.isArray(rootReport.roots) ? rootReport.roots : [];
	const gevurahMaxRoots = boundedInteger(options.maxRoots, 24, 0, 24);
	const tiferesRadialSegments = boundedInteger(options.rootRadialSegments, 6, 3, 12);
	const yesodSelected = rootReport.enabled === false ? [] : keterRoots.slice(0, gevurahMaxRoots);
	const malchusBuffer = createTreeBiologyMeshBuffer();
	const binahFeatures = [];
	for (const root of yesodSelected) {
		const startVertex = malchusBuffer.positions.length / 3;
		const startIndex = malchusBuffer.indices.length;
		const startRadius = Math.max(0.001, treeBiologyNumber(root.radius, 0.05));
		const taper = Math.max(0, Math.min(0.98, treeBiologyNumber(root.taper, 0.84)));
		appendTreeBiologyTaperedTube(malchusBuffer, {
			direction: root.direction,
			endRadius: Math.max(startRadius * 0.04, startRadius * (1 - taper)),
			length: Math.max(0.001, treeBiologyNumber(root.length, 1)),
			origin: root.origin,
			radialSegments: tiferesRadialSegments,
			startRadius
		});
		binahFeatures.push(Object.freeze({
			id: root.id,
			indexCount: malchusBuffer.indices.length - startIndex,
			indexStart: startIndex,
			vertexCount: malchusBuffer.positions.length / 3 - startVertex,
			vertexStart: startVertex
		}));
	}
	return Object.freeze({
		budget: gevurahMaxRoots,
		emittedCount: yesodSelected.length,
		enabled: rootReport.enabled !== false,
		features: Object.freeze(binahFeatures),
		materialRole: 'tree.root',
		mesh: finishTreeBiologyMeshBuffer(malchusBuffer),
		omittedCount: rootReport.enabled === false ? 0 : Math.max(0, keterRoots.length - yesodSelected.length),
		radialSegments: tiferesRadialSegments,
		sourceCount: keterRoots.length
	});
}
