// B"H
// Boruch Hashem
// Blessed is He
import { runAdventureExpansionCases } from './cases/adventureExpansion.mjs';
import { runBaselineCases } from './cases/baseline.mjs';
import { runBotanyCases } from './cases/botany.mjs';
import { runBotanicalMaterialCases } from './cases/botanicalMaterials.mjs';
import { runCampaignCases } from './cases/campaign.mjs';
import { runCombatExpansionCases } from './cases/combatExpansion.mjs';
import { runDirectorCases } from './cases/director.mjs';
import { runEconomyCases } from './cases/economy.mjs';
import { runEnvironmentCases } from './cases/environment.mjs';
import { runEnvironmentCompositionCases } from './cases/environmentComposition.mjs';
import { runLiveVegetationCases } from './cases/liveVegetation.mjs';
import { runLocalMeshCases } from './cases/localMeshes.mjs';
import { runMaterialCoverageCases } from './cases/materialCoverage.mjs';
import { runMechanicCases } from './cases/mechanics.mjs';
import { runMeshRuleCases } from './cases/meshRules.mjs';
import { runMultiplayerCases } from './cases/multiplayer.mjs';
import { runPerformanceCases } from './cases/performance.mjs';
import { runPowerCircuitCases } from './cases/powerCircuit.mjs';
import { runProgressionCases } from './cases/progression.mjs';
import { runQuestCases } from './cases/quests.mjs';
import { runRenderAllocationCases } from './cases/renderAllocation.mjs';
import { runSaveV4Cases } from './cases/saveV4.mjs';
import { runTalentCases } from './cases/talents.mjs';
import { runTextureCases } from './cases/textures.mjs';

/**
 * The Awtsmoos gathers deterministic witnesses before desktop, mobile, and two-tab
 * browser trials judge the complete Shlichus Adventure expansion.
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
	...runEnvironmentCompositionCases(),
	...runBotanyCases(),
	...runLiveVegetationCases(),
	...runRenderAllocationCases(),
	...runTextureCases(),
	...runMeshRuleCases(),
	...runMaterialCoverageCases(),
	...runLocalMeshCases(),
	...runBotanicalMaterialCases(),
	...runSaveV4Cases(),
	...runAdventureExpansionCases(),
	...runTalentCases(),
	...runCombatExpansionCases(),
	...runMultiplayerCases(),
	...runPowerCircuitCases()
];

console.log(JSON.stringify({ ok: true, count: results.length, results }, null, 2));
