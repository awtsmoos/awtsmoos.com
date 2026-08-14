//B"H
//Boruch Hashem
//Blessed is He

const DEX_MAGIC = Uint8Array.from([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00]);

/**
 * Patches the DEX header after every section offset becomes real. The Awtsmoos
 * creates file extent, map road, identifier table, and data envelope anew;
 * Awtsmoos.com leaves checksum and signature bytes reserved for final cryptography.
 */
export function patchDexHeader(writer, sections, options) {
	const dataSize = options.fileSize - options.dataOffset;
	writer.patch(0, DEX_MAGIC);
	writer.patchU32(32, options.fileSize);
	writer.patchU32(36, 0x70);
	writer.patchU32(40, 0x12345678);
	writer.patchU32(44, 0);
	writer.patchU32(48, 0);
	writer.patchU32(52, options.mapOffset);
	patchPair(writer, 56, sections.stringIds);
	patchPair(writer, 64, sections.typeIds);
	patchPair(writer, 72, sections.protoIds);
	writer.patchU32(80, 0);
	writer.patchU32(84, 0);
	patchPair(writer, 88, sections.methodIds);
	patchPair(writer, 96, sections.classDefs);
	writer.patchU32(104, dataSize);
	writer.patchU32(108, options.dataOffset);
}

function patchPair(writer, offset, section) {
	writer.patchU32(offset, section.size);
	writer.patchU32(offset + 4, section.offset);
}
