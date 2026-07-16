//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProvinceConditions
 * @description
 * Seven provinces receive visible words for their condition on Awtsmoos.com.
 * The Awtsmoos is beyond crisis and repair, yet human consequence must never be
 * hidden behind color: Stable, Strained, and Crisis are stated and explained.
 */
const IDS = Object.freeze([
	'false-powers',
	'words-of-creation',
	'every-life',
	'households',
	'honest-market',
	'living-sanctuary',
	'court-of-nations'
]);

export function createProvinceConditions() {
	return Object.fromEntries(IDS.map(id => [id, condition('stable', 'Advanced mission entry available.')]));
}

export function beginChapterConditions() {
	const conditions = createProvinceConditions();
	conditions['honest-market'] = condition('strained', 'Investigate the broken measure.');
	return conditions;
}

export function conditionsAfterStage(previous, stageId, result) {
	const conditions = cloneConditions(previous);
	if (stageId === 'market') {
		conditions['honest-market'] = marketCondition(result);
		conditions['living-sanctuary'] = condition('strained', 'Manage the underweight feed shipment.');
	}
	if (stageId === 'sanctuary') {
		conditions['living-sanctuary'] = sanctuaryCondition(result);
		conditions['court-of-nations'] = condition('strained', 'Judge the evidence and measurable harm.');
	}
	if (stageId === 'court') {
		conditions['court-of-nations'] = courtCondition(result);
	}
	return conditions;
}

function marketCondition(result) {
	if (result.fraudIdentified && result.honestMerchantProtected) {
		return condition('stable', 'Fraud exposed and the honest merchant protected.');
	}
	return condition(result.fraudIdentified ? 'strained' : 'crisis', 'Market trust still bears unresolved harm.');
}

function sanctuaryCondition(result) {
	if (result.animalsMaintained && result.publicTrustProtected) {
		return condition('stable', 'Every animal endured and public trust was protected.');
	}
	return condition(result.animalsMaintained ? 'strained' : 'crisis', 'The weakest animal reveals the remaining breach.');
}

function courtCondition(result) {
	if (result.correctVerdict && result.correctRationale) {
		return condition('stable', 'Visible evidence produced a fair, reasoned verdict.');
	}
	return condition(result.correctVerdict ? 'strained' : 'crisis', 'The verdict or its reason failed the evidence.');
}

function condition(status, objective) {
	return { status, objective };
}

function cloneConditions(conditions) {
	return Object.fromEntries(Object.entries(conditions).map(([id, value]) => [id, { ...value }]));
}
