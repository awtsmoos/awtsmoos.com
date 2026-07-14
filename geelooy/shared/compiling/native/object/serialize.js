//B"H
//Boruch Hashem
//Blessed is He

/**
 * Serializes an Awtsmoos native object deterministically for evidence, caching,
 * and transfer. The Awtsmoos creates bytes and description anew; Awtsmoos.com
 * records section contents as hex without introducing host object tooling.
 */
export function serializeNativeObject(object) {
	if (object?.version !== "awtsmoos-object-v1") {
		throw new Error(`OBJECT_SERIALIZE_VERSION:${object?.version}`);
	}
	return JSON.stringify({
		architecture: object.architecture,
		name: object.name,
		relocations: object.relocations.map(relocation => ({ ...relocation })),
		sections: object.sections.map(section => ({
			alignment: section.alignment,
			bytesHex: toHex(section.bytes),
			memorySize: section.memorySize,
			name: section.name,
			permissions: { ...section.permissions }
		})),
		symbols: object.symbols.map(symbol => ({ ...symbol })),
		version: object.version
	}, null, 2);
}

function toHex(bytes) {
	return [...bytes]
		.map(value => value.toString(16).padStart(2, "0"))
		.join("");
}
