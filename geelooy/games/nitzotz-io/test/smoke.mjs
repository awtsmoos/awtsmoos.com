// B"H
// Boruch Hashem
// Blessed is He
import { runBaselineCases } from './cases/baseline.mjs';
import { runBotanyCases } from './cases/botany.mjs';
import { runCampaignCases } from './cases/campaign.mjs';
import { runDirectorCases } from './cases/director.mjs';
import { runEconomyCases } from './cases/economy.mjs';
import { runEnvironmentCases } from './cases/environment.mjs';
import { runMechanicCases } from './cases/mechanics.mjs';
import { runPerformanceCases } from './cases/performance.mjs';
import { runProgressionCases } from './cases/progression.mjs';
import { runQuestCases } from './cases/quests.mjs';

/**
 * Awtsmoos.com gathers deterministic witnesses before the browser judges the city.
 * Mechanic behavior now stands beside campaign, environment, botany, and progression.
 */
const results = [
	...runBaselineCases(),
	...runCampaignCases(),
	...runDirectorCases(),
	...runEconomyCases(),
	...runProgressionCases(),
	...runQuestCases(),
	...runMechanicCases(),
	...runPerformanceCases(),
	...runEnvironmentCases(),
	...runBotanyCases()
];

console.log(JSON.stringify({ ok: true, count: results.length, results }, null, 2));
