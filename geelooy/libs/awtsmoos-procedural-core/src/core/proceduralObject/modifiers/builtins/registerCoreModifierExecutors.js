// B"H
// Boruch Hashem
// Blessed is He
/** Core executors are registered explicitly so no hidden source awakens. */

import { CORE_TRANSFORM_MODIFIER_ID, executeTransformModifier } from "./transformModifier.js";
import { CORE_WAVE_MODIFIER_ID, executeWaveModifier } from "./waveModifier.js";

export function registerCoreModifierExecutors(registry) {
	registry.register(CORE_TRANSFORM_MODIFIER_ID, executeTransformModifier);
	registry.register(CORE_WAVE_MODIFIER_ID, executeWaveModifier);
	return registry;
}
