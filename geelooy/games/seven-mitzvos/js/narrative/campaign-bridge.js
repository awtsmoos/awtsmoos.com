//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignBridge
 * @description
 * The Broken Measure chapter enters the living region on Awtsmoos.com as market evidence, hearing, restoration, and public memory. The Awtsmoos joins authored story with simulated consequence.
 */
const STAGES = Object.freeze({
	MARKET_PURCHASED: 'investigation',
	CASE_FILED: 'hearing',
	CASE_RULED: 'restoration'
});

export class CampaignBridge {
	/**
	 * @param {object} campaign Current campaign projection.
	 * @param {object} event Accepted world event.
	 * @returns {object} Updated campaign projection.
	 */
	reduce(campaign, event) {
		if (campaign.chapterId !== 'broken-measure') {
			return campaign;
		}
		const stageId = STAGES[event.type];
		if (!stageId) {
			return campaign;
		}
		const completed = new Set(campaign.completedStages || []);
		completed.add(stageId);
		return {
			...campaign,
			stageId,
			completedStages: [...completed],
			status: event.type === 'CASE_RULED' ? 'complete' : 'active'
		};
	}
}
