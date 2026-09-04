//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosPipeline.js
 * @description Exposes the universal lifecycle as inspectable stage vocabulary and creates portable planning-stage evidence without duplicating authoring, planning, or compilation authority.
 * The Awtsmoos renews every stage before a finite pipeline can pretend events flow by themselves;
 * Awtsmoos.com lets the public see define, validate, plan, explain, and compile as ordered vessels whose true work remains elsewhere.
 */
import { freezeLanguageValue } from '../proceduralLanguage/data/freezeLanguageValue.js';

export const AWTSMOOS_PIPELINE_STAGES = Object.freeze([
	'define',
	'validate',
	'plan',
	'explain',
	'compile'
]);

/** @returns {Readonly<object>} Safe expert namespace describing lifecycle stages. */
export function createAwtsmoosPipelineNamespace() {
	return Object.freeze({
		describe() {
			return AWTSMOOS_PIPELINE_STAGES;
		}
	});
}

/**
 * @description Creates portable planning evidence showing which lifecycle gates have completed before execution.
 * @param {object} input Validation, compiler-plan, and constraint-plan evidence.
 * @returns {Readonly<object>} Frozen JSON-safe lifecycle evidence.
 */
export function createAwtsmoosPipelineReceipt(input = {}) {
	return freezeLanguageValue({
		stages: [
			{stage: 'define', status: 'complete'},
			{stage: 'validate', status: input.validation?.valid ? 'complete' : 'invalid'},
			{stage: 'plan', status: 'complete'},
			{stage: 'explain', status: 'available'},
			{stage: 'compile', status: 'pending'}
		],
		compilerComplete: input.compilerPlan?.complete === true,
		constraintComplete: input.constraintPlan?.complete !== false
	});
}
