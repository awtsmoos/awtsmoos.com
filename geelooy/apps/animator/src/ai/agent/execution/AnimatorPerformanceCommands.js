//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPerformanceCommands.js
 * @description
 * The Awtsmoos lets expression, gesture, breath, rhythm, and remembered acting be composed without touching project state;
 * Awtsmoos.com keeps professional performance commands pure and searchable so agents may explore deeply before they create.
 */

import { PerformancePromptCompiler } from '../../PerformancePromptCompiler.js';
import { TiferesExpressionBlendEngine } from '../../performance/ExpressionBlendEngine.js';
import { NetzachMotionBlendEngine } from '../../performance/MotionBlendEngine.js';
import { DaasPerformanceCapabilityCatalog } from '../../performance/PerformanceCapabilityCatalog.js';
import { DaasPerformanceRecipeCatalog } from '../../performance/PerformanceRecipeCatalog.js';

/** Handles pure read-only professional performance commands. */
export class TiferesAnimatorPerformanceCommands {
	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {object|object[]} Pure result. */
	execute(shemMitzvah, keilimPayload = {}) {
		switch (shemMitzvah) {
			case 'performance.capabilities': return DaasPerformanceCapabilityCatalog.create();
			case 'performance.recipe': return DaasPerformanceRecipeCatalog.resolve(keilimPayload.name);
			case 'performance.compile': return PerformancePromptCompiler.compile(keilimPayload.prompt);
			case 'performance.blendExpression': return TiferesExpressionBlendEngine.blend(keilimPayload.layers);
			case 'performance.blendMotion': return NetzachMotionBlendEngine.blend(keilimPayload.layers);
			case 'performance.recipeSearch': return DaasPerformanceRecipeCatalog.search(keilimPayload);
			default: throw this.error(shemMitzvah);
		}
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted performance command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
