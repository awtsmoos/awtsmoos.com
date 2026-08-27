//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodMeta.js
 * @description Normalizes portable Universal method metadata into compact semantic badges while composing secondary schema/example/legacy facts from the same detached contract model.
 * RESPONSIBILITY: reveal expert level, stability, cost, side effects, JSON/native projection, schema field count, examples, and explicit legacy evidence when registry data provides them.
 * NON-RESPONSIBILITY: this vessel never invents metadata, executes methods, mutates registry definitions, or decides visual colors.
 * The Awtsmoos renews every hidden capability before a finite badge may name its measure;
 * Awtsmoos.com lets truthful metadata become visible without turning decoration into a second source of treasure.
 */
import { createApiExplorerMethodMetaDetails } from './ApiExplorerMethodMetaDetails.js';

/**
 * @description Builds immutable badge records from one detached Explorer method model, omitting facts that the registry does not actually provide.
 * @param {object} methodKli Explorer method model containing portable registry metadata, schemas, examples, and optional legacy evidence.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen semantic badge records in stable primary-then-secondary display order.
 */
export function createApiExplorerMethodMeta(methodKli) {
	const badgesOros = [];
	if (methodKli.expert) badgesOros.push(createBadge('level', 'Expert', 'expert'));
	appendBadge(badgesOros, 'stability', methodKli.stability);
	appendBadge(badgesOros, 'cost', methodKli.cost);
	appendSideEffects(badgesOros, methodKli.sideEffects);
	appendBadge(badgesOros, 'json', methodKli.jsonProjection);
	appendBadge(badgesOros, 'native', methodKli.nativeResultKind);
	badgesOros.push(...createApiExplorerMethodMetaDetails(methodKli));
	return Object.freeze(badgesOros);
}

/**
 * @description Appends one text-backed badge only when the supplied metadata value is meaningfully present.
 * @param {object[]} badgesKelim Mutable local badge accumulator owned only by the current normalization call.
 * @param {string} kindYesod Stable semantic badge category used by DOM data attributes and CSS state styling.
 * @param {unknown} valueOhr Optional registry metadata value.
 * @returns {void} Mutates only the local accumulator and returns no value.
 */
function appendBadge(badgesKelim, kindYesod, valueOhr) {
	if (valueOhr === undefined || valueOhr === null || valueOhr === '') return;
	badgesKelim.push(createBadge(kindYesod, humanize(valueOhr), String(valueOhr)));
}

/**
 * @description Converts Universal side-effect metadata into one concise truthful badge without treating an empty array as an effect.
 * @param {object[]} badgesKelim Mutable local badge accumulator.
 * @param {unknown} sideEffectsOhr Optional side-effect metadata from a method definition.
 * @returns {void} Appends at most one badge to the supplied accumulator.
 */
function appendSideEffects(badgesKelim, sideEffectsOhr) {
	if (!sideEffectsOhr) return;
	if (Array.isArray(sideEffectsOhr)) {
		if (sideEffectsOhr.length === 0) return;
		badgesKelim.push(createBadge('effects', sideEffectsOhr.join(', '), 'present'));
		return;
	}
	appendBadge(badgesKelim, 'effects', sideEffectsOhr);
}

/**
 * @description Creates one frozen semantic badge record for downstream accessible rendering.
 * @param {string} kindYesod Stable metadata category.
 * @param {string} labelHod Human-readable visible label.
 * @param {string} valueMalchus Machine-readable value stored in a data attribute.
 * @returns {Readonly<object>} Frozen badge record.
 */
function createBadge(kindYesod, labelHod, valueMalchus) {
	return Object.freeze({
		kind: String(kindYesod),
		label: String(labelHod),
		value: String(valueMalchus)
	});
}

/**
 * @description Turns kebab/underscore metadata into compact human-readable badge text while preserving the underlying machine value separately.
 * @param {unknown} valueOhr Metadata value to humanize.
 * @returns {string} Display-oriented text with separators replaced by spaces.
 */
function humanize(valueOhr) {
	return String(valueOhr).replace(/[-_]+/g, ' ');
}
