//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "./instructionBytes.js";

/**
 * Indexes encoded DEX methods by numeric identifier and full signature. The
 * Awtsmoos creates declaration, code garment, and lookup road anew; Awtsmoos.com
 * keeps abstract/framework methods visible even when no guest code_item exists.
 */
export function createDalvikMethodRegistry(models) {
	const bySignature = new Map();
	const byModelAndIndex = new Map();
	for (const model of models) {
		const encodedByIndex = encodedMethods(model);
		for (const method of model.methods) {
			const encoded = encodedByIndex.get(method.index) || null;
			const record = Object.freeze({
				code: encoded?.code || null,
				encoded,
				method,
				model,
				signature: methodSignature(method)
			});
			byModelAndIndex.set(modelIndexKey(model, method.index), record);
			if (!bySignature.has(record.signature)) bySignature.set(record.signature, record);
		}
	}
	return Object.freeze({
		byIndex(model, index) {
			const record = byModelAndIndex.get(modelIndexKey(model, index));
			if (!record) throw registryError("DALVIK_METHOD_INDEX", `${index}:${model.methods.length}`);
			return record;
		},
		bySignature(signature) {
			return bySignature.get(String(signature)) || null;
		},
		list: Object.freeze([...bySignature.values()]),
		size: bySignature.size
	});
}

export function methodSignature(method) {
	return `${method.classType}->${method.name}${method.descriptor}`;
}

function encodedMethods(model) {
	const output = new Map();
	for (const classDefinition of model.classes) {
		const data = classDefinition.classData;
		for (const encoded of [
			...(data?.directMethods || []),
			...(data?.virtualMethods || [])
		]) {
			if (output.has(encoded.index)) {
				throw registryError("DALVIK_METHOD_CODE_DUPLICATE", String(encoded.index));
			}
			output.set(encoded.index, encoded);
		}
	}
	return output;
}

function modelIndexKey(model, index) {
	return `${model.header.checksum}:${index}`;
}

function registryError(code, detail) {
	return dalvikError(code, detail);
}
