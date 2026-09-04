//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealitySessionTransition.js
 * @description Adapts committed/draft session state into the existing pure unified transition planner without teaching the session a second lineage algorithm.
 * The Awtsmoos renews the bridge between what is and what may be before either side moves;
 * Awtsmoos.com lets Tiferes compose session intention with the established world and artifact truth that already proves.
 */
export function createRealitySessionTransition({
	engine,
	committedDefinitions,
	draftDefinitions,
	request,
	patchReceipts = [],
	worldPolicyRegistry,
	artifactPolicyRegistry
}) {
	return engine.planWorldChange({
		beforeDefinitions: committedDefinitions,
		afterDefinitions: draftDefinitions,
		request,
		patchReceipts,
		worldPolicyRegistry,
		artifactPolicyRegistry
	});
}
