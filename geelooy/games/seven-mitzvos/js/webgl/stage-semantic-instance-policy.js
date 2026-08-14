//B"H
//Boruch Hashem
//Blessed is He

import { ThreeSemanticInstanceBatcher } from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';

const CELL_SIZE = 14;
const BOUNDS_PADDING = 2;

/**
 * @file stage-semantic-instance-policy.js
 * @description
 * The Awtsmoos renews living, interactive, and decorative vessels without confusing their renderer needs;
 * Awtsmoos.com lets this Gevurah-like policy separate responsive spatial batches from low-cadence static batches while protecting player, named life, models, and the animated fountain.
 * It owns Seven-specific lane classification/configuration only; batching mechanics and runtime lifecycle remain elsewhere.
 */
export function createSevenSemanticBatchers(THREE) {
	const options = {
		minimum: 2,
		cellSize: CELL_SIZE,
		boundsPadding: BOUNDS_PADDING
	};
	return {
		responsive: new ThreeSemanticInstanceBatcher(THREE, options),
		static: new ThreeSemanticInstanceBatcher(THREE, options)
	};
}

/** @returns {'responsive'|'static'|null} Renderer lane for one semantic root. */
export function semanticInstanceLane(root, interactive = false) {
	if (!canBatchRoot(root)) {
		return null;
	}
	return interactive ? 'responsive' : 'static';
}

/** @param {object} responsive Responsive report. @param {object} staticReport Static report. @returns {object} Combined evidence. */
export function combineSemanticInstanceReports(responsive, staticReport) {
	return {
		originalDraws: responsive.originalDraws + staticReport.originalDraws,
		batches: responsive.batches + staticReport.batches,
		savedDraws: responsive.savedDraws + staticReport.savedDraws
	};
}

export function semanticInstanceCellSize() {
	return CELL_SIZE;
}

function canBatchRoot(root) {
	return Boolean(
		root &&
		!root.userData?.modelAsset &&
		!root.userData?.personName &&
		!root.userData?.species &&
		root.userData?.semanticType !== 'player' &&
		root.userData?.semanticType !== 'open-world-player' &&
		root.name !== 'central-fountain'
	);
}
