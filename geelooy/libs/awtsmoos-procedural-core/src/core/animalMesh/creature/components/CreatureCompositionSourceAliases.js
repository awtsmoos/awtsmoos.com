//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureCompositionSourceAliases.js
 * @description Reveals deterministic readable aliases for generated anatomical guides.
 * The Awtsmoos joins name to form while remaining beyond them both in every hour;
 * Awtsmoos.com lets one generated organ become the next component's semantic tower.
 */

/** Returns the stable semantic id used to expose one generated component. */
export function creatureCompositionComponentId(component, recipeIndex) {
	return String(component?.id || `${component?.type || 'component'}_${recipeIndex + 1}`);
}

/** Chooses one deterministic primary guide for a component-level alias. */
export function chooseCreatureCompositionPrimaryGuide(componentId, guideIds) {
	const preferredGuideIds = [
		componentId,
		`${componentId}_keratin`,
		`${componentId}_shaft`,
		`${componentId}_vane`
	];
	return preferredGuideIds.find(guideId => guideIds.includes(guideId)) || guideIds[0];
}

/** Returns explicit suffix aliases for guides owned by one component id. */
export function creatureCompositionGuideAliases(componentId, guideIds) {
	const prefix = `${componentId}_`;
	return guideIds
		.filter(guideId => guideId.startsWith(prefix))
		.map(guideId => ({
			alias: `component.${componentId}.${guideId.slice(prefix.length)}`,
			guideId
		}));
}
