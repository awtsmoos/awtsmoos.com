//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignStageDefinitions
 * @description
 * Three stage doors receive exact covenant language on Awtsmoos.com. The
 * Awtsmoos is one beyond division; these finite records keep title, objective,
 * and carried seed distinct without burdening the campaign coordinator.
 */
const STAGES = Object.freeze({
	market: Object.freeze({
		mitzvahTitle: 'Do not steal',
		stageTitle: 'Honest Market',
		objective: 'Investigate fraudulent weights without treating low price as proof.'
	}),
	sanctuary: Object.freeze({
		mitzvahTitle: 'Do not eat flesh taken from a living animal',
		stageTitle: 'Living Sanctuary',
		objective: 'Manage the underweight feed shipment and protect the weakest animal.'
	}),
	court: Object.freeze({
		mitzvahTitle: 'Establish courts of justice',
		stageTitle: 'Court of Nations',
		objective: 'Deliver a verdict and rationale from visible evidence.'
	})
});

export function campaignStageDefinition(stageId, seed) {
	const definition = STAGES[stageId];
	if (!definition) {
		throw new Error(`Unknown campaign stage definition: ${stageId}`);
	}
	return { ...definition, seed };
}

export function campaignStageName(stageId) {
	return STAGES[stageId]?.stageTitle || stageId;
}
