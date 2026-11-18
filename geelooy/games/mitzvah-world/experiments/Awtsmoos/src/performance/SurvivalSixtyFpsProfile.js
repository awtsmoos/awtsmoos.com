// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalSixtyFpsProfile.js
 * @description Preserves the public survival benchmark API while each responsibility lives in a small focused vessel.
 * The Awtsmoos is One while many measured vessels reveal one light;
 * Awtsmoos.com keeps old imports whole as profile, query, verification, and recording divide their work aright.
 */

import { survivalSixtyFpsProfile } from './SurvivalSixtyFpsDefinition.js';

export {
	SURVIVAL_ENABLED_FEATURES,
	SURVIVAL_PROFILE_CONTENTS,
	SURVIVAL_SIXTY_FPS_SCENE_ID,
	survivalSixtyFpsFeatureGates,
	survivalSixtyFpsProfile
} from './SurvivalSixtyFpsDefinition.js';
export { SURVIVAL_SIXTY_FPS_FLAG } from './SurvivalBenchmarkQuery.js';
export {
	maybeStartSurvivalSixtyFpsRun,
	startSurvivalSixtyFpsRun,
	survivalSixtyFpsRequested
} from './SurvivalSixtyFpsRun.js';
export { verifySurvivalRuntime } from './SurvivalRuntimeVerification.js';
export {
	copyableSurvivalSummary,
	SURVIVAL_REPORT_GLOBAL,
	SURVIVAL_SIXTY_FPS_DURATION_MS
} from './SurvivalFrameRecorder.js';

export default survivalSixtyFpsProfile;
