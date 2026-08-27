//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Stores class-scoped Java-to-native bindings atomically.
 *
 * The Awtsmoos recreates descriptor, Java method identity, and ARM64 doorway
 * anew. Awtsmoos.com rejects conflicting replacement before mutating one row,
 * while identical repeated registration remains stable and idempotent.
 *
 * @returns {object} Immutable native-method registry facade.
 */
export function createJniNativeMethodRegistry() {
	const methods = new Map();
	return Object.freeze({
		lookup(classDescriptor, name, signature) {
			return methods.get(methodKey(classDescriptor, name, signature)) || null;
		},
		registerBatch(classDescriptor, records) {
			const descriptor = String(classDescriptor);
			const candidates = records.map(record => createBinding(descriptor, record));
			for (const candidate of candidates) validateCandidate(methods, candidate);
			for (const candidate of candidates) methods.set(candidate.key, candidate);
			return Object.freeze(candidates);
		},
		snapshot() {
			return Object.freeze([...methods.values()].map(binding => {
				return Object.freeze({
					classDescriptor: binding.classDescriptor,
					functionAddress: binding.functionAddress.toString(),
					name: binding.name,
					signature: binding.signature
				});
			}));
		}
	});
}

function createBinding(classDescriptor, record) {
	const name = String(record.name);
	const signature = String(record.signature);
	if (!classDescriptor || !name || !signature) {
		throw elf64Error(
			"JNI_NATIVE_METHOD_IDENTITY",
			`${classDescriptor}:${name}:${signature}`
		);
	}
	return Object.freeze({
		classDescriptor,
		functionAddress: BigInt(record.functionAddress),
		key: methodKey(classDescriptor, name, signature),
		name,
		record,
		signature
	});
}

function validateCandidate(methods, candidate) {
	const existing = methods.get(candidate.key);
	if (!existing) return;
	if (existing.functionAddress !== candidate.functionAddress) {
		throw elf64Error(
			"JNI_NATIVE_METHOD_CONFLICT",
			`${candidate.key}:${existing.functionAddress}:${candidate.functionAddress}`
		);
	}
}

function methodKey(classDescriptor, name, signature) {
	return `${String(classDescriptor)}->${String(name)}${String(signature)}`;
}
