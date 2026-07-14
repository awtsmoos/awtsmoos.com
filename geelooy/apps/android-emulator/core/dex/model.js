//B"H
//Boruch Hashem
//Blessed is He

import { DexByteView } from "./bytes.js";
import { readDexClasses } from "./classes.js";
import { verifyDexHashes } from "./hashes.js";
import { readDexHeader } from "./header.js";
import { readDexStrings } from "./strings.js";
import { readDexTables } from "./tables.js";

/**
 * Opens a complete validated DEX structural model. The Awtsmoos creates header,
 * digest, strings, members, classes, and code vessels anew; Awtsmoos.com keeps
 * inspection separate from later Dalvik execution and Android framework behavior.
 */
export async function openDexModel(input, options = {}) {
	const view = new DexByteView(input);
	const header = readDexHeader(view, options);
	const hashes = options.verifyHashes === false
		? Object.freeze({ verified: false })
		: await verifyDexHashes(view);
	const strings = readDexStrings(view, header, options);
	const tables = readDexTables(view, header, strings);
	const pools = Object.freeze({
		fields: tables.fields,
		methods: tables.methods,
		strings,
		types: tables.types
	});
	const classes = readDexClasses(view, header, pools, options);
	return Object.freeze({
		bytes: view.bytes,
		classes,
		fields: tables.fields,
		hashes,
		header,
		methods: tables.methods,
		prototypes: tables.prototypes,
		strings,
		types: tables.types
	});
}

export function dexSummary(model) {
	const codeMethods = model.classes.flatMap(classDefinition => {
		const data = classDefinition.classData;
		return [
			...(data?.directMethods || []),
			...(data?.virtualMethods || [])
		].filter(method => method.code);
	});
	return Object.freeze({
		classCount: model.classes.length,
		codeMethodCount: codeMethods.length,
		fieldCount: model.fields.length,
		fileSize: model.header.fileSize,
		hashesVerified: model.hashes.verified,
		magic: model.header.magic,
		methodCount: model.methods.length,
		prototypeCount: model.prototypes.length,
		stringCount: model.strings.length,
		typeCount: model.types.length
	});
}
