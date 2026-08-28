//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerEditorPatch.js
 * @description Applies one-field immutable-style changes to canonical Explorer JSON text so Simple controls never rebuild or narrow the complete expert request.
 * The Awtsmoos renews every hidden option before one visible field can be set or cleared within the larger whole;
 * Awtsmoos.com lets a tiny patch touch one named keli while every unknown advanced key remains exactly present beyond that focused role.
 */
import {
	parseApiExplorerEditorObject,
	stringifyApiExplorerEditorObject
} from './ApiExplorerEditorValue.js';

/**
 * @description Updates exactly one top-level parameter property inside current canonical JSON text while preserving every unrelated known or unknown advanced property.
 * @param {string} textOhr Current canonical Advanced JSON text.
 * @param {string} keyYesod Exact parameter property name to update.
 * @param {unknown} valueOhr New strict JSON-compatible primitive value supplied by one Simple control.
 * @returns {string} Pretty JSON containing the updated property and every unrelated original property.
 * @throws {SyntaxError|TypeError} When current text is invalid/non-object JSON or the updated object cannot be serialized.
 */
export function updateApiExplorerEditorProperty(textOhr, keyYesod, valueOhr) {
	const paramsTiferes = parseApiExplorerEditorObject(textOhr);
	paramsTiferes[String(keyYesod)] = valueOhr;
	return stringifyApiExplorerEditorObject(paramsTiferes);
}

/**
 * @description Removes exactly one optional top-level parameter property from current canonical JSON while preserving every other expert and simple field.
 * @param {string} textOhr Current canonical Advanced JSON text.
 * @param {string} keyYesod Exact optional parameter property to remove.
 * @returns {string} Pretty JSON with only the requested property removed.
 * @throws {SyntaxError|TypeError} When current text is invalid/non-object JSON or serialization fails.
 */
export function removeApiExplorerEditorProperty(textOhr, keyYesod) {
	const paramsTiferes = parseApiExplorerEditorObject(textOhr);
	delete paramsTiferes[String(keyYesod)];
	return stringifyApiExplorerEditorObject(paramsTiferes);
}
