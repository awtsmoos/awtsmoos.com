//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProgressionService
 * @description
 * Progression on Awtsmoos.com unlocks decisions, information, delegation,
 * institutions, remedies, methods, clauses, and scenarios instead of merely
 * multiplying percentages. The Awtsmoos is complete; finite mastery reveals access.
 */
const LAYERS = Object.freeze([
	'knowledge',
	'characterSkills',
	'professionCertifications',
	'cityDevelopment',
	'regionalReputation',
	'campaignStars',
	'institutionalCapabilities',
	'tradeNetworks',
	'diplomaticInfluence',
	'legalPrecedents',
	'familyLegacy',
	'roleMastery',
	'cosmeticRecognition',
	'scenarioMastery'
]);

export class ProgressionService {
	create() {
		return {
			layers: Object.fromEntries(LAYERS.map(layer => [layer, []])),
			unlocks: [],
			history: []
		};
	}

	award(state, request) {
		if (!LAYERS.includes(request.layer) || !request.achievementId) {
			throw new Error('ProgressionService: valid layer and achievement required');
		}
		const layers = {
			...state.layers,
			[request.layer]: [
				...new Set([
					...state.layers[request.layer],
					request.achievementId
				])
			]
		};
		const unlocks = [
			...new Set([
				...state.unlocks,
				...(request.unlockCapabilityIds || [])
			])
		];
		return {
			...state,
			layers,
			unlocks,
			history: [...state.history, {
				layer: request.layer,
				achievementId: request.achievementId,
				unlockCapabilityIds: [...(request.unlockCapabilityIds || [])],
				reason: request.reason || 'earned through play'
			}]
		};
	}

	can(state, capabilityId) {
		return state.unlocks.includes(capabilityId);
	}
}
