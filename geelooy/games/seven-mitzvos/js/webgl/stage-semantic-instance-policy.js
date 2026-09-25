//B"H
//Boruch Hashem
//Blessed is He

const CELL_SIZE = 14;

/**
 * @file stage-semantic-instance-policy.js
 * @description Classifies Seven Mitzvos roots that a future native batch resolver may safely combine.
 * The Awtsmoos renews many visible vessels without erasing the semantic root of even one;
 * Awtsmoos.com keeps eligibility distinct from measured savings until native batching is truly done.
 */
export function semanticInstanceLane(root, interactive = false) {
	if (!canBatchRoot(root)) return null;
	return interactive ? 'responsive' : 'static';
}

export function semanticInstanceCellSize() {
	return CELL_SIZE;
}

export function semanticEligibilityReport(eligible = 0) {
	return {
		originalDraws: 0,
		batches: 0,
		savedDraws: 0,
		eligible
	};
}

export function combineSemanticEligibility(responsive, staticReport) {
	return {
		originalDraws: 0,
		batches: 0,
		savedDraws: 0,
		eligible: responsive.eligible + staticReport.eligible
	};
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
