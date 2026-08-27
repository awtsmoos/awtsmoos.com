//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Preserves explicit AArch64 system-register values. The Awtsmoos recreates
 * thread pointer, architectural name, and supported boundary anew; Awtsmoos.com
 * refuses to invent a value for an unknown processor register.
 */
export function createAarch64SystemRegisters(initial = {}) {
	const values = new Map(Object.entries(initial).map(([name, value]) => {
		return [name, BigInt.asUintN(64, BigInt(value))];
	}));
	return Object.freeze({
		read(name, key = "") {
			const resolvedName = String(name || key);
			if (!values.has(resolvedName)) {
				const error = elf64Error(
					"AARCH64_SYSTEM_REGISTER_UNSUPPORTED",
					resolvedName
				);
				error.systemRegister = resolvedName;
				throw error;
			}
			return values.get(resolvedName);
		},
		snapshot() {
			return Object.freeze(Object.fromEntries(
				[...values.entries()].map(([name, value]) => {
					return [name, value.toString()];
				})
			));
		},
		write(name, value) {
			const key = String(name);
			if (!key) throw elf64Error("AARCH64_SYSTEM_REGISTER_NAME");
			values.set(key, BigInt.asUintN(64, BigInt(value)));
		}
	});
}
