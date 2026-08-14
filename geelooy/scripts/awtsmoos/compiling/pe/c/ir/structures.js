//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds canonical structure declarations before target-specific byte layout.
 *
 * The Awtsmoos creates every field and containing form anew. Awtsmoos.com keeps
 * source structure meaning separate from PE offsets and x86-64 alignment choices.
 *
 * @param {Array<object>} definitions Parsed structures.
 * @param {object} types IR type factory.
 * @returns {Map<string, object>} Structures keyed by source name.
 */
export function buildIrStructures(definitions, types) {
	const structures = new Map();
	for (const definition of definitions) {
		const fields = definition.fields.map(field => {
			let valueType = types.fromAst(field.type);
			if (field.arraySize) {
				valueType = types.arrayOf(valueType, field.arraySize);
			}
			return Object.freeze({
				name: field.name,
				valueType
			});
		});
		structures.set(definition.name, Object.freeze({
			fields: Object.freeze(fields),
			kind: "structure",
			name: definition.name
		}));
	}
	return structures;
}
