//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UniversalSemanticAuthoringKernel.js
 * @description Reveals the noun-neutral authoring layer shared by every universal
 * semantic kernel: definitions, explicit quantities, and artifact requests.
 * The Awtsmoos renews intention, measure, and desired artifact before any finite
 * compiler can claim a world as its own;
 * Awtsmoos.com lets Chochmah keep authored truth portable while every future
 * domain enters through the same clear stone.
 */

import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createQuantityDescriptor } from '../quantity/createQuantityDescriptor.js';

export class UniversalSemanticAuthoringKernel {
	/**
	 * @description Normalizes arbitrary portable authored semantic data through the
	 * canonical procedural Definition contract without adding domain assumptions.
	 * @param {object|string} chochmahData Definition-compatible object or shorthand
	 * kind accepted by the existing procedural-language definition constructor.
	 * @returns {Readonly<object>} Deeply immutable canonical procedural Definition.
	 */
	define(chochmahData) {
		return createProceduralDefinition(chochmahData);
	}

	/**
	 * @description Creates one explicit unit-bearing scalar value so measurements
	 * cross architecture, biology, simulation, and tools without hidden unit rules.
	 * @param {object|number} chochmahData Quantity-compatible authored value or
	 * shorthand finite scalar.
	 * @returns {Readonly<object>} Deeply immutable portable quantity descriptor.
	 */
	quantity(chochmahData) {
		return createQuantityDescriptor(chochmahData);
	}

	/**
	 * @description Normalizes desired output into renderer-neutral required and
	 * optional artifact channels plus quality, budget, adapter, and LOD intent.
	 * @param {object} [chochmahData={}] Artifact-request compatible authoring data.
	 * @returns {Readonly<object>} Deeply immutable canonical artifact request.
	 */
	request(chochmahData = {}) {
		return createArtifactRequest(chochmahData);
	}
}
