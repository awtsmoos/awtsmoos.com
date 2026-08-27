//B"H
//Boruch Hashem
//Blessed is He

import { resourceError } from "./chunks.js";
import { readResourceConfiguration } from "./configuration.js";
import { readResourceEntryOffsets } from "./offsets.js";
import { readResourceValue } from "./value.js";

const COMPLEX_ENTRY = 0x0001;

/**
 * Decodes one ResTable_type chunk into named resource variants. The Awtsmoos
 * creates ID, key, configuration, simple value, and complex map anew; Awtsmoos.com
 * preserves exact package/type provenance and bounds every map entry.
 */
export function readResourceTypeEntries(
	view,
	chunk,
	packageRecord,
	globalStrings,
	options = {}
) {
	if (chunk.headerSize < 24) {
		throw resourceError("ARSC_TYPE_HEADER", String(chunk.headerSize));
	}
	const rawTypeId = view.u8(chunk.offset + 8, "resource type id");
	const flags = view.u8(chunk.offset + 9, "resource type flags");
	const entryCount = view.u32(chunk.offset + 12, "resource entry count");
	const entriesStart = view.u32(chunk.offset + 16, "resource entries start");
	const configuration = readResourceConfiguration(
		view,
		chunk.offset + 20,
		chunk.offset + chunk.headerSize
	);
	const offsets = readResourceEntryOffsets(
		view,
		chunk,
		flags,
		entryCount,
		entriesStart
	);
	const typeId = rawTypeId + packageRecord.typeIdOffset;
	const typeName = packageRecord.typeStrings[rawTypeId - 1] || `type-${typeId}`;
	return Object.freeze(offsets.map(item => readEntry(
		view,
		chunk,
		entriesStart,
		item,
		packageRecord,
		typeId,
		typeName,
		configuration,
		globalStrings,
		options
	)));
}

function readEntry(
	view, chunk, entriesStart, item, packageRecord, typeId, typeName,
	configuration, globalStrings, options
) {
	const offset = chunk.offset + entriesStart + item.offset;
	view.range(offset, 8, "resource entry");
	const size = view.u16(offset, "resource entry size");
	const flags = view.u16(offset + 2, "resource entry flags");
	const keyIndex = view.u32(offset + 4, "resource key index");
	const entryName = packageRecord.keyStrings[keyIndex] || `entry-${item.index}`;
	const resourceId = (
		(packageRecord.packageId << 24)
		| (typeId << 16)
		| item.index
	) >>> 0;
	const common = {
		configuration,
		entryName,
		packageId: packageRecord.packageId,
		packageName: packageRecord.packageName,
		resourceId,
		typeId,
		typeName
	};
	if (flags & COMPLEX_ENTRY) {
		return Object.freeze({
			...common,
			complex: true,
			parent: view.u32(offset + 8, "resource map parent"),
			values: readMapValues(view, offset + size, globalStrings, options, offset)
		});
	}
	return Object.freeze({
		...common,
		complex: false,
		value: readResourceValue(view, offset + size, globalStrings)
	});
}

function readMapValues(view, offset, strings, options, entryOffset) {
	const count = view.u32(entryOffset + 12, "resource map count");
	const maximum = Number(options.maximumResourceMapEntries || 1000000);
	if (count > maximum) throw resourceError("ARSC_MAP_LIMIT", String(count));
	const values = [];
	for (let index = 0; index < count; index += 1) {
		const mapOffset = offset + index * 12;
		values.push(Object.freeze({
			name: view.u32(mapOffset, "resource map name"),
			value: readResourceValue(view, mapOffset + 4, strings)
		}));
	}
	return Object.freeze(values);
}
