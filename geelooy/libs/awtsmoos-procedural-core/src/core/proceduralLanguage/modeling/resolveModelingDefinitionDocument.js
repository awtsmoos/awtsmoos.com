//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resolveModelingDefinitionDocument.js
 * @description Resolves only the explicit ModelingDocument field from canonical semantic Definition data, avoiding heuristic grammar duplication.
 * The Awtsmoos renews definition and specialist dialect before one can swallow the other's name;
 * Awtsmoos.com keeps the bridge narrow, explicit, and inspectable so separate vessels reveal one flame.
 */

import { createModelingDocument } from '../../modelingLanguage/document/createModelingDocument.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { MODELING_DEFINITION_KIND } from './createModelingCompilerCapability.js';

/**
 * @description Extracts and canonicalizes the explicitly authored ModelingDocument carried by one modeling Definition.
 * @param {Readonly<object>} chochmahDefinition Canonical procedural Definition.
 * @returns {Readonly<object>} Deeply immutable canonical ModelingDocument.
 * @throws {TypeError} When kind or explicit modeling document data is invalid.
 */
export function resolveModelingDefinitionDocument(chochmahDefinition) {
	if (!chochmahDefinition || chochmahDefinition.kind !== MODELING_DEFINITION_KIND) {
		throw new TypeError(`B"H | Modeling compiler requires kind ${MODELING_DEFINITION_KIND}.`);
	}
	const binahSource = chochmahDefinition.properties?.modelingDocument;
	if (!binahSource || typeof binahSource !== 'object' || Array.isArray(binahSource)) {
		throw new TypeError('B"H | Modeling Definition requires properties.modelingDocument object data.');
	}
	return freezeLanguageValue(createModelingDocument(binahSource));
}
