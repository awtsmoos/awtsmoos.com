//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerSimpleSchema.js
 * @description Projects only safely representable top-level Universal parameter schema fields into Simple-editor descriptors while explicitly preserving every unsupported complex field for Advanced JSON.
 * The Awtsmoos renews simplicity and depth together before one finite form can pretend to contain an entire schema;
 * Awtsmoos.com lets simple controls reveal what they truly understand while arrays, objects, unions, and future expert shapes remain untouched beyond that narrower beam.
 */

const SIMPLE_TYPES = Object.freeze([
	'boolean',
	'integer',
	'number',
	'string'
]);

/**
 * @description Builds one immutable Simple-editor schema model from a Universal method parameter schema without narrowing or mutating the original schema.
 * @param {object} [paramsSchemaBinah={}] Detached portable Universal parameter schema, usually an object schema with optional `properties` and `required` fields.
 * @returns {Readonly<{fields:ReadonlyArray<object>,unsupportedKeys:ReadonlyArray<string>}>} Frozen supported field descriptors plus unsupported top-level property names that remain available through Advanced JSON.
 */
export function createApiExplorerSimpleSchema(paramsSchemaBinah = {}) {
	const propertiesKelim = isPlainObject(paramsSchemaBinah.properties)
		? paramsSchemaBinah.properties
		: {};
	const requiredOros = new Set(Array.isArray(paramsSchemaBinah.required) ? paramsSchemaBinah.required.map(String) : []);
	const fieldsOros = [];
	const unsupportedOros = [];
	for (const [keyYesod, schemaKli] of Object.entries(propertiesKelim)) {
		const descriptorBinah = createFieldDescriptor(keyYesod, schemaKli, requiredOros.has(keyYesod));
		if (descriptorBinah) fieldsOros.push(descriptorBinah);
		else unsupportedOros.push(keyYesod);
	}
	return Object.freeze({
		fields: Object.freeze(fieldsOros),
		unsupportedKeys: Object.freeze(unsupportedOros)
	});
}

/**
 * @description Converts one safely representable primitive or enum schema property into an immutable UI-neutral field descriptor.
 * @param {string} keyYesod Exact top-level parameter property name.
 * @param {unknown} schemaOhr Candidate portable property schema.
 * @param {boolean} requiredOhr Whether the parent object schema marks this property required.
 * @returns {Readonly<object>|null} Frozen field descriptor, or null when the field requires Advanced JSON.
 */
function createFieldDescriptor(keyYesod, schemaOhr, requiredOhr) {
	if (!isPlainObject(schemaOhr)) return null;
	const enumOros = Array.isArray(schemaOhr.enum) ? schemaOhr.enum : null;
	const typeYesod = String(schemaOhr.type || inferEnumType(enumOros) || '');
	if (!SIMPLE_TYPES.includes(typeYesod)) return null;
	if (enumOros && !enumOros.every(isPrimitiveEnumValue)) return null;
	return Object.freeze({
		control: enumOros ? 'select' : typeToControl(typeYesod),
		description: String(schemaOhr.description || ''),
		enumValues: enumOros ? Object.freeze([...enumOros]) : null,
		key: String(keyYesod),
		label: humanizeKey(keyYesod),
		required: Boolean(requiredOhr),
		type: typeYesod
	});
}

/**
 * @description Infers a primitive type only when every enum value shares one supported JavaScript primitive family.
 * @param {unknown[]|null} enumOros Optional enum values from the property schema.
 * @returns {string|null} Supported inferred schema type or null when inference would be ambiguous.
 */
function inferEnumType(enumOros) {
	if (!enumOros || enumOros.length === 0) return null;
	const typesOros = new Set(enumOros.map((valueOhr) => typeof valueOhr));
	if (typesOros.size !== 1) return null;
	const typeYesod = [...typesOros][0];
	return SIMPLE_TYPES.includes(typeYesod) ? typeYesod : null;
}

/**
 * @description Maps one supported schema primitive to its native simple-control family.
 * @param {string} typeYesod Supported schema primitive type.
 * @returns {'checkbox'|'number'|'text'} Native control family used by the field view.
 */
function typeToControl(typeYesod) {
	if (typeYesod === 'boolean') return 'checkbox';
	if (typeYesod === 'integer' || typeYesod === 'number') return 'number';
	return 'text';
}

/**
 * @description Returns whether one enum value can be represented reversibly by the Simple-editor select control.
 * @param {unknown} valueOhr Candidate enum value.
 * @returns {boolean} True for string, number, or boolean values only.
 */
function isPrimitiveEnumValue(valueOhr) {
	return ['boolean', 'number', 'string'].includes(typeof valueOhr);
}

/**
 * @description Humanizes camelCase, snake_case, and kebab-case property names for visible labels without changing canonical keys.
 * @param {string} keyYesod Exact schema property key.
 * @returns {string} Human-readable label preserving the original key separately in the descriptor.
 */
function humanizeKey(keyYesod) {
	return String(keyYesod)
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[-_]+/g, ' ')
		.replace(/^./, (characterOhr) => characterOhr.toUpperCase());
}

/**
 * @description Detects plain portable schema records without accepting arrays or class-bearing objects.
 * @param {unknown} valueOhr Candidate schema value.
 * @returns {boolean} True only for ordinary object records.
 */
function isPlainObject(valueOhr) {
	return Boolean(valueOhr && typeof valueOhr === 'object' && !Array.isArray(valueOhr));
}
