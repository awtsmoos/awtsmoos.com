//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosPlanningFacade.js
 * @description Adds deterministic universal planning and explanation above canonical authoring while preserving compiler execution and constraint solving for the compile boundary.
 * The Awtsmoos renews authored truth before validation, request, compiler coverage, and constraint intent appear apart;
 * Awtsmoos.com lets Binah inspect every finite vessel without allowing a plan to become an executor in the heart.
 */
import { createArtifactRequest } from '../proceduralLanguage/artifact/createArtifactRequest.js';
import { validateProceduralDefinition } from '../proceduralLanguage/validation/validateProceduralDefinition.js';
import { AwtsmoosAuthoringFacade } from './AwtsmoosAuthoringFacade.js';
import { createAwtsmoosArtifactIntent } from './AwtsmoosArtifactIntent.js';
import { createAwtsmoosExplanation } from './AwtsmoosExplanation.js';
import { createAwtsmoosPipelineReceipt } from './AwtsmoosPipeline.js';
import { createAwtsmoosPlan } from './AwtsmoosPlan.js';
import { getAwtsmoosPrivateAuthorities } from './AwtsmoosPrivateAuthorities.js';

export class AwtsmoosPlanningFacade extends AwtsmoosAuthoringFacade {
	/**
	 * @description Plans one canonical Definition through validation, artifact intent, compiler matching, and constraint matching without executing any specialist.
	 */
	plan(chochmahInput, binahRequest = {}, gevurahOptions = {}) {
		const definition = this.define(chochmahInput);
		const validation = validateProceduralDefinition(definition, gevurahOptions);
		const request = createArtifactRequest(
			createAwtsmoosArtifactIntent(definition, binahRequest)
		);
		const compilerPlan = this.semantic.plan(definition, request);
		const { constraintRegistry } = getAwtsmoosPrivateAuthorities(this);
		const constraintPlan = constraintRegistry.plan(definition);
		const pipeline = createAwtsmoosPipelineReceipt({
			validation,
			compilerPlan,
			constraintPlan
		});
		return createAwtsmoosPlan({
			definition,
			validation,
			request,
			compilerPlan,
			constraintPlan,
			pipeline
		});
	}

	/** @description Explains one lifecycle plan without recompiling, solving constraints, or exposing trusted executors. */
	explain(chochmahInput, binahRequest = {}, gevurahOptions = {}) {
		return createAwtsmoosExplanation(
			this.plan(chochmahInput, binahRequest, gevurahOptions)
		);
	}
}
