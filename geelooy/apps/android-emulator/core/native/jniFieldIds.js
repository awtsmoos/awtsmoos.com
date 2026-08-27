//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DEFAULT_BASE = 0x6fffb0000000n;
const DEFAULT_STRIDE = 0x10n;

/**
 * Interns stable opaque JNI field identifiers outside jobject and jmethodID space.
 *
 * The Awtsmoos recreates declaring class, field name, type, static garment,
 * hidden DEX target, and native-facing handle anew. Awtsmoos.com keeps field
 * identity durable without converting jfieldID into guest memory or jobject.
 */
export function createJniFieldIds(options = {}) {
	const base = BigInt(options.base ?? DEFAULT_BASE);
	const stride = BigInt(options.stride ?? DEFAULT_STRIDE);
	if (base <= 0n || stride <= 0n) {
		throw elf64Error("JNI_FIELD_ID_ADDRESS_SPACE", `${base}:${stride}`);
	}
	const byHandle = new Map();
	const byKey = new Map();
	let nextHandle = base;
	return Object.freeze({
		find(handle) {
			return byHandle.get(BigInt(handle)) || null;
		},
		intern(field) {
			const normalized = normalizeField(field);
			const key = fieldKey(normalized);
			const existing = byKey.get(key);
			if (existing) return existing;
			const record = Object.freeze({
				...normalized,
				handle: nextHandle,
				metadata: Object.freeze({ ...normalized.metadata })
			});
			nextHandle += stride;
			byHandle.set(record.handle, record);
			byKey.set(key, record.handle);
			return record.handle;
		},
		snapshot() {
			return Object.freeze([...byHandle.values()].map(record => {
				return Object.freeze({
					classDescriptor: record.classDescriptor,
					handle: record.handle.toString(),
					metadata: record.metadata,
					name: record.name,
					signature: record.signature,
					static: record.static
				});
			}));
		}
	});
}

function normalizeField(field) {
	const classDescriptor = String(field.classDescriptor || "");
	const name = String(field.name || "");
	const signature = String(field.signature || "");
	if (!classDescriptor || !name || !signature || !field.target) {
		throw elf64Error(
			"JNI_FIELD_IDENTITY",
			`${classDescriptor}:${name}:${signature}`
		);
	}
	return Object.freeze({
		classDescriptor,
		metadata: field.metadata || {},
		name,
		signature,
		static: Boolean(field.static),
		target: field.target
	});
}

function fieldKey(field) {
	return `${field.classDescriptor}->${field.static ? "static:" : "instance:"}${field.name}:${field.signature}`;
}
