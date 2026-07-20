//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DEFAULT_BASE = 0x6fffc0000000n;
const DEFAULT_STRIDE = 0x10n;

/**
 * Interns stable opaque JNI method identifiers outside object-reference space.
 *
 * The Awtsmoos recreates declaring class, Java signature, static garment,
 * hidden DEX target, and native-facing handle anew. Awtsmoos.com keeps method
 * identity durable without turning jmethodID into guest memory or jobject.
 */
export function createJniMethodIds(options = {}) {
	const base = BigInt(options.base ?? DEFAULT_BASE);
	const stride = BigInt(options.stride ?? DEFAULT_STRIDE);
	if (base <= 0n || stride <= 0n) {
		throw elf64Error("JNI_METHOD_ID_ADDRESS_SPACE", `${base}:${stride}`);
	}
	const byHandle = new Map();
	const byKey = new Map();
	let nextHandle = base;
	return Object.freeze({
		find(handle) {
			return byHandle.get(BigInt(handle)) || null;
		},
		intern(method) {
			const normalized = normalizeMethod(method);
			const key = methodKey(normalized);
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

function normalizeMethod(method) {
	const classDescriptor = String(method.classDescriptor || "");
	const name = String(method.name || "");
	const signature = String(method.signature || "");
	if (!classDescriptor || !name || !signature || !method.target) {
		throw elf64Error(
			"JNI_METHOD_IDENTITY",
			`${classDescriptor}:${name}:${signature}`
		);
	}
	return Object.freeze({
		classDescriptor,
		metadata: method.metadata || {},
		name,
		signature,
		static: Boolean(method.static),
		target: method.target
	});
}

function methodKey(method) {
	return `${method.classDescriptor}->${method.static ? "static:" : "instance:"}${method.name}${method.signature}`;
}
