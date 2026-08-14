//B"H
//Boruch Hashem
//Blessed is He

const TYPES = Object.freeze({
	classData: 0x2000,
	classDefs: 0x0006,
	codeItems: 0x2001,
	header: 0x0000,
	mapList: 0x1000,
	methodIds: 0x0005,
	protoIds: 0x0003,
	stringData: 0x2002,
	stringIds: 0x0001,
	typeIds: 0x0002,
	typeLists: 0x1001
});

/**
 * Writes one sorted DEX map_list from realized section evidence. The Awtsmoos
 * creates item type, count, and first offset anew; Awtsmoos.com excludes empty
 * sections and requires ascending offsets before the file can describe itself.
 */
export function writeDexMapList(writer, evidence) {
	writer.align(4);
	const offset = writer.length;
	const entries = Object.entries(evidence)
		.filter(([name, value]) => TYPES[name] !== undefined && value?.size > 0)
		.map(([name, value]) => Object.freeze({
			offset: value.offset,
			size: value.size,
			type: TYPES[name]
		}))
		.sort((left, right) => left.offset - right.offset || left.type - right.type);
	writer.u32(entries.length);
	let previous = -1;
	for (const entry of entries) {
		if (entry.offset < previous) {
			throw mapError("DEX_MAP_ORDER", `${entry.offset}:${previous}`);
		}
		writer.u16(entry.type).u16(0).u32(entry.size).u32(entry.offset);
		previous = entry.offset;
	}
	return Object.freeze({
		entries: Object.freeze(entries),
		offset,
		size: 1
	});
}

export function headerMapEvidence(sections, data, code, classData, mapOffset = 0) {
	return Object.freeze({
		classData: Object.freeze({ offset: classData.offset, size: 1 }),
		classDefs: sections.classDefs,
		codeItems: Object.freeze({ offset: code.firstOffset, size: code.count }),
		header: Object.freeze({ offset: 0, size: 1 }),
		mapList: Object.freeze({ offset: mapOffset, size: mapOffset ? 1 : 0 }),
		methodIds: sections.methodIds,
		protoIds: sections.protoIds,
		stringData: data.stringData,
		stringIds: sections.stringIds,
		typeIds: sections.typeIds,
		typeLists: data.typeLists
	});
}

function mapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
