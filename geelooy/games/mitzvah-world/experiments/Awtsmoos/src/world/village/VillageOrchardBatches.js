// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageOrchardBatches.js
 * @description Builds compact trunks and canopies upon supported F03 and F04 orchard terraces.
 * The Awtsmoos raises fruit from hidden roots; Awtsmoos.com places each tree on the canonical
 * plot surface while preserving compact spacing and compatible material batches.
 */

import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import {
	createFarmBox,
	farmBatchOptions,
	rotatedFarmPoint
} from './VillageFarmGeometry.js';

export function createOrchardBatches(footprints, options) {
	return [
		createOrchardBatch(footprints, options, orchardKind('trunks')),
		createOrchardBatch(footprints, options, orchardKind('canopies'))
	];
}

function createOrchardBatch(footprints, options, kind) {
	const boxes = footprints.flatMap((footprint) => {
		return createOrchardGrid(footprint, options.groundSampler, kind);
	});
	return createVillageBoxBatch(
		`canonical-orchard-${kind.name}`,
		boxes,
		farmBatchOptions(
			options,
			kind.color,
			`orchard-${kind.name}`,
			kind.texture(options)
		)
	);
}

function createOrchardGrid(footprint, groundSampler, kind) {
	const boxes = [];
	const top = canonicalFoundationTopHeight(
		footprint.id,
		groundSampler,
		footprint.x,
		footprint.z
	);
	for (const localX of horizontalOffsets(footprint)) {
		for (const localZ of depthOffsets(footprint)) {
			const point = rotatedFarmPoint(footprint, localX, localZ);
			boxes.push(createFarmBox(
				point.x,
				top + 0.24 + kind.height / 2 + kind.lift,
				point.z,
				kind.width,
				kind.height,
				kind.width,
				footprint.yaw
			));
		}
	}
	return boxes;
}

function horizontalOffsets(footprint) {
	return [-footprint.width * 0.25, 0, footprint.width * 0.25];
}

function depthOffsets(footprint) {
	return [-footprint.depth * 0.22, footprint.depth * 0.22];
}

function orchardKind(name) {
	const canopy = name === 'canopies';
	return Object.freeze({
		color: canopy ? '#526d35' : '#68482f',
		height: canopy ? 1.4 : 2.2,
		lift: canopy ? 2.5 : 0,
		name,
		texture(options) {
			return canopy ? options.materials.stone : options.materials.wood;
		},
		width: canopy ? 1.7 : 0.32
	});
}
