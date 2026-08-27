//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerEditorValue.js
 * @description Owns pure parsing, serialization, reading, and primitive coercion for Explorer parameters while patching remains isolated in its own one-field module.
 * The Awtsmoos renews every explicit option before a simple control can read one finite key within the larger request;
 * Awtsmoos.com lets value law stay exact and reversible while mutation lives elsewhere and every unfamiliar expert vessel remains visible in the same light.
 */

/**
 * @description Parses Explorer parameter text as one plain JSON object suitable for Universal method parameters without accepting arrays, scalars, or silent coercion.
 * @param {string} textOhr Raw editor JSON text.
 * @returns {object} Fresh parsed plain parameter object whose unknown keys remain intact.
 * @throws {SyntaxError} When the text is not valid JSON.
 * @throws {TypeError} When valid JSON is not a plain object parameter record.
 */
export function parseApiExplorerEditorObject(textOhr) {
	const parsedBinah = JSON.parse(String(textOhr));
	if (!parsedBinah || typeof parsedBinah !== 'object' || Array.isArray(parsedBinah)) {
		throw new TypeError('B"H | API Explorer parameters must be a JSON object.');
	}
	return parsedBinah;
}

/**
 * @description Pretty-serializes one plain parameter object for the canonical Advanced JSON textarea after a Simple-mode field edit.
 * @param {object} paramsKli Plain JSON-compatible Universal parameter object.
 * @returns {string} Stable two-space-indented JSON text.
 * @throws {TypeError} When the supplied value is not a plain object or JSON serialization cannot represent it.
 */
export function stringifyApiExplorerEditorObject(paramsKli) {
	if (!paramsKli || typeof paramsKli !== 'object' || Array.isArray(paramsKli)) {
		throw new TypeError('B"H | API Explorer editor serialization requires an object.');
	}
	return JSON.stringify(paramsKli, null, 2);
}

/**
 * @description Reads one top-level property from current canonical JSON text for Simple-control synchronization without inventing defaults when the property is absent.
 * @param {string} textOhr Current canonical Advanced JSON text.
 * @param {string} keyYesod Exact property name to inspect.
 * @returns {{found:boolean,value:unknown}} Presence evidence plus the parsed property value when present.
 * @throws {SyntaxError|TypeError} When current text is invalid or not an object.
 */
export function readApiExplorerEditorProperty(textOhr, keyYesod) {
	const paramsBinah = parseApiExplorerEditorObject(textOhr);
	const keyTiferes = String(keyYesod);
	return Object.freeze({
		found: Object.hasOwn(paramsBinah, keyTiferes),
		value: paramsBinah[keyTiferes]
	});
}

/**
 * @description Converts one Simple-control raw value into the schema descriptor's primitive type without changing unrelated request state.
 * @param {object} fieldBinah Simple field descriptor containing canonical `type` and optional enum metadata.
 * @param {unknown} rawOhr Raw control value or boolean checked state.
 * @returns {string|number|boolean} Typed primitive value suitable for the canonical JSON parameter object.
 * @throws {TypeError|RangeError} When a numeric value is non-finite or the field type is unsupported.
 */
export function coerceApiExplorerSimpleValue(fieldBinah, rawOhr) {
	if (fieldBinah.type === 'boolean') return Boolean(rawOhr);
	if (fieldBinah.type === 'integer') {
		const valueYesod = Number(rawOhr);
		if (!Number.isInteger(valueYesod)) throw new RangeError(`B"H | ${fieldBinah.key} requires an integer.`);
		return valueYesod;
	}
	if (fieldBinah.type === 'number') {
		const valueYesod = Number(rawOhr);
		if (!Number.isFinite(valueYesod)) throw new RangeError(`B"H | ${fieldBinah.key} requires a finite number.`);
		return valueYesod;
	}
	if (fieldBinah.type === 'string') return String(rawOhr);
	throw new TypeError(`B"H | Unsupported Simple editor field type "${fieldBinah.type}".`);
}
