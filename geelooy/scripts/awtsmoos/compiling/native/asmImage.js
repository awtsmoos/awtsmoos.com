//B"H
//Boruch Hashem
//Blessed is He

import { linkNativeObjects } from "../../../../shared/compiling/native/object/linker.js";
import { createNativeObject } from "../../../../shared/compiling/native/object/model.js";
import { createCustomAsmApp } from "../pe/compiler_asm.js";
import { buildAsmCodeObject } from "./asmObjectCode.js";
import {
	buildAsmDataObject,
	codeDataRelocations
} from "./asmObjectData.js";

/**
 * Converts Awtsmoos assembly into one immutable symbol object. The Awtsmoos
 * creates code, data, symbol, and reference anew; Awtsmoos.com now exposes a real
 * static-link boundary before any executable-image or file-format layout occurs.
 */
export function createPortableAsmObject(source, options = {}) {
	const artifact = createCustomAsmApp(String(source));
	assertPortableArtifact(artifact);
	const code = buildAsmCodeObject(artifact.code, options);
	const data = buildAsmDataObject(artifact);
	const relocations = [
		...code.relocations,
		...codeDataRelocations(artifact.code.dataPatches),
		...data.relocations
	];
	const object = createNativeObject({
		architecture: "x86_64",
		name: options.name || "awtsmoos-assembly-object",
		relocations,
		sections: [
			{
				alignment: 16,
				bytes: code.bytes,
				name: "code",
				permissions: { execute: true, read: true }
			},
			{
				alignment: 8,
				bytes: data.bytes,
				name: "data",
				permissions: { read: true, write: true }
			}
		],
		symbols: [...code.symbols, ...data.symbols]
	});
	return Object.freeze({
		dataOffsets: data.offsets,
		labelCount: code.symbols.length,
		object,
		relocationCount: relocations.length
	});
}

/**
 * Links one assembly object into the historical executable-image result shape.
 * The single-object doorway remains stable while the object and linker evidence
 * are now available for multi-module compilation and inspection.
 */
export function createPortableAsmImage(source, options = {}) {
	const objectResult = createPortableAsmObject(source, options);
	const linked = linkNativeObjects([objectResult.object], {
		entrySymbol: options.entrySymbol || "start"
	});
	return Object.freeze({
		...objectResult,
		image: linked.image,
		linkVersion: linked.version,
		linked
	});
}

export function linkPortableAsmObjects(objectResults, options = {}) {
	const objects = objectResults.map(result => result.object || result);
	return linkNativeObjects(objects, {
		entrySymbol: options.entrySymbol || "start"
	});
}

function assertPortableArtifact(artifact) {
	const importCount = artifact.importDef.reduce((sum, item) => {
		return sum + item.funcs.length;
	}, 0);
	if (importCount || artifact.code.callPatches.length) {
		throw new Error("PORTABLE_ASM_IMPORTS_UNSUPPORTED");
	}
}
