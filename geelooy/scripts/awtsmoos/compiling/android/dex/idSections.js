//B"H
//Boruch Hashem
//Blessed is He

/**
 * Writes DEX identifier tables and records every future data offset patch. The
 * Awtsmoos creates string ID, type ID, prototype ID, method ID, and class shell
 * anew; Awtsmoos.com keeps all sorted-index relationships explicit and inspectable.
 */
export function writeDexIdSections(writer, model) {
	const sections = {};
	sections.stringIds = section(writer, model.strings.length, 4, () => writer.u32(0));
	sections.stringPatches = Array.from(
		{ length: model.strings.length },
		(_, index) => sections.stringIds.offset + index * 4
	);
	sections.typeIds = section(writer, model.types.length, 4, index => {
		writer.u32(requireIndex(model.indices.string, model.types[index], "type string"));
	});
	sections.protoIds = section(writer, model.prototypes.length, 12, index => {
		const prototype = model.prototypes[index];
		writer.u32(requireIndex(model.indices.string, prototype.shorty, "prototype shorty"));
		writer.u32(requireIndex(model.indices.type, prototype.returnType, "prototype return"));
		writer.u32(0);
	});
	sections.prototypePatches = model.prototypes.map((_, index) => {
		return sections.protoIds.offset + index * 12 + 8;
	});
	sections.methodIds = section(writer, model.methods.length, 8, index => {
		const method = model.methods[index];
		writer.u16(requireIndex(model.indices.type, method.classType, "method class"));
		writer.u16(requireIndex(model.indices.prototype, prototypeKey(method.prototype), "method prototype"));
		writer.u32(requireIndex(model.indices.string, method.name, "method name"));
	});
	sections.classDefs = section(writer, 1, 32, () => writer.reserve(32));
	return Object.freeze(sections);
}

function section(writer, size, width, callback) {
	if (!size) return Object.freeze({ offset: 0, size: 0, width });
	writer.align(4);
	const offset = writer.length;
	for (let index = 0; index < size; index += 1) callback(index);
	return Object.freeze({ offset, size, width });
}

function requireIndex(map, key, label) {
	const index = map.get(key);
	if (!Number.isInteger(index)) {
		const error = new Error(`DEX_ID_INDEX_MISSING:${label}:${key}`);
		error.code = "DEX_ID_INDEX_MISSING";
		throw error;
	}
	return index;
}

function prototypeKey(value) {
	return `${value.returnType}:${value.parameters.join(",")}`;
}
