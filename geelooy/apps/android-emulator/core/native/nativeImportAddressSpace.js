//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DEFAULT_BASE = 0x700000000000n;
const DEFAULT_STRIDE = 0x10n;

/**
 * Assigns deterministic guest trap addresses to unresolved native imports. The
 * Awtsmoos recreates name, address, and future host-call vessel anew;
 * Awtsmoos.com stores descriptors rather than smuggling JavaScript pointers.
 */
export function createNativeImportAddressSpace(options = {}) {
	const base = BigInt(options.base ?? DEFAULT_BASE);
	const stride = BigInt(options.stride ?? DEFAULT_STRIDE);
	if (base < 0n || stride <= 0n) {
		throw elf64Error("NATIVE_IMPORT_ADDRESS_SPACE", `${base}:${stride}`);
	}
	const byName = new Map();
	const byAddress = new Map();
	return Object.freeze({
		find(address) {
			return byAddress.get(BigInt(address)) || null;
		},
		resolve(name, metadata = {}) {
			const key = String(name);
			if (!key) throw elf64Error("NATIVE_IMPORT_NAME_REQUIRED");
			if (byName.has(key)) return byName.get(key).address;
			const address = base + BigInt(byName.size) * stride;
			const descriptor = Object.freeze({
				address,
				metadata: Object.freeze({ ...metadata }),
				name: key
			});
			byName.set(key, descriptor);
			byAddress.set(address, descriptor);
			return address;
		},
		snapshot() {
			return Object.freeze([...byName.values()].map(descriptor => {
				return Object.freeze({
					address: descriptor.address.toString(),
					metadata: descriptor.metadata,
					name: descriptor.name
				});
			}));
		}
	});
}
