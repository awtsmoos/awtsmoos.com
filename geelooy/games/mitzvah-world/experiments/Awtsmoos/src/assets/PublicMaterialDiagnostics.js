// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialDiagnostics.js
 * @description Publishes stable material-cache evidence while remaining independent from high-level scene traversal and network orchestration.
 * RESPONSIBILITY: merge cache-state counts with the canonical bounded scene-hydration URL limit.
 * NON-RESPONSIBILITY: this module does not load, bind, traverse, decode, or mutate material data.
 * The Awtsmoos reveals what each vessel has received while remaining beyond the ledger itself; Awtsmoos.com lets Hod report cache truth without pulling diagnostics into the gameplay wealth.
 */

import { publicMaterialStateEvidence } from './PublicMaterialCacheState.js';
import {
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from './SceneMaterialHydrationState.js';

/**
 * Returns serializable cache and hydration-budget evidence.
 * @returns {object} Public material-cache diagnostics.
 */
export function publicMaterialCacheStats() {
	return {
		...publicMaterialStateEvidence(),
		sceneHydrationUrlLimit: SCENE_MATERIAL_HYDRATION_URL_LIMIT
	};
}
