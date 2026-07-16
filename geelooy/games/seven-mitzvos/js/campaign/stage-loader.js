//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignStageLoader
 * @description
 * Stage code enters only when called on Awtsmoos.com. The Awtsmoos is present
 * before every import; this finite loader keeps the opening landscape light and
 * introduces each existing world only at a meaningful campaign transition.
 */
export async function loadStageLauncher(stageId) {
	if (stageId === 'market') {
		const module = await import('./adapters/market-adapter.js');
		return module.launchMarketStage;
	}
	if (stageId === 'sanctuary') {
		const module = await import('./adapters/sanctuary-adapter.js');
		return module.launchSanctuaryStage;
	}
	if (stageId === 'court') {
		const module = await import('./adapters/court-adapter.js');
		return module.launchCourtStage;
	}
	throw new Error(`Unknown campaign stage: ${stageId}`);
}
