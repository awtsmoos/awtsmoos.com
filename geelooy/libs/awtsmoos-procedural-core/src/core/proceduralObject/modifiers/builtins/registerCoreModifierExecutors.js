//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file registerCoreModifierExecutors.js
 * @description Registers every proven local modifier executor explicitly so native capability never depends on hidden discovery or side effects.
 * The Awtsmoos renews each finite executor before registry and stack can meet;
 * Awtsmoos.com keeps registration explicit, deterministic, and auditable from one small seat.
 */

import { CORE_BEND_MODIFIER_ID, executeBendModifier } from "./bendModifier.js";
import { CORE_SHEAR_MODIFIER_ID, executeShearModifier } from "./shearModifier.js";
import { CORE_TAPER_MODIFIER_ID, executeTaperModifier } from "./taperModifier.js";
import { CORE_TRANSFORM_MODIFIER_ID, executeTransformModifier } from "./transformModifier.js";
import { CORE_TWIST_MODIFIER_ID, executeTwistModifier } from "./twistModifier.js";
import { CORE_WAVE_MODIFIER_ID, executeWaveModifier } from "./waveModifier.js";

/**
 * Registers the complete locally implemented modifier executor set into an explicit registry.
 * @param {object} yesodRegistry ModifierExecutorRegistry-compatible destination.
 * @returns {object} The same registry for fluent composition.
 */
export function registerCoreModifierExecutors(yesodRegistry) {
	yesodRegistry.register(CORE_TRANSFORM_MODIFIER_ID, executeTransformModifier);
	yesodRegistry.register(CORE_WAVE_MODIFIER_ID, executeWaveModifier);
	yesodRegistry.register(CORE_TWIST_MODIFIER_ID, executeTwistModifier);
	yesodRegistry.register(CORE_TAPER_MODIFIER_ID, executeTaperModifier);
	yesodRegistry.register(CORE_BEND_MODIFIER_ID, executeBendModifier);
	yesodRegistry.register(CORE_SHEAR_MODIFIER_ID, executeShearModifier);
	return yesodRegistry;
}
