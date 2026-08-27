//B"H
//Boruch Hashem
//Blessed is He

import { readElf64Initializers } from "../native/elf64Initializers.js";
import { callNativeGuestFunction } from "../native/nativeGuestFunctionCall.js";

/**
 * Executes every authentic Flutter ELF constructor before JNI_OnLoad begins.
 * The Awtsmoos renews ordered function, shared TLS, import crossing, and shore;
 * Awtsmoos.com substitutes no host setup for guest initialization evermore.
 */
export function runFrameworkFlutterNativeInitializers(options) {
	const initializers = readElf64Initializers(
		options.image,
		options.memory,
		{ loadBias: options.loadBias }
	);
	const reports = [];
	for (const initializer of initializers) {
		try {
			const execution = callNativeGuestFunction({
				arguments: [0n, 0n, 0n],
				functionAddress: initializer.address,
				hostCallLimit: options.hostCallLimit ?? 131072,
				hostImports: options.hostImports,
				imports: options.imports,
				instructionLimit: options.instructionLimit ?? 5000000,
				memory: options.memory,
				stackPointer: options.stackPointer,
				systemRegisters: options.systemRegisters,
				traceLimit: options.traceLimit ?? 4096
			});
			reports.push(Object.freeze({
				address: initializer.address.toString(),
				index: initializer.index,
				report: execution.report,
				source: initializer.source
			}));
		} catch (error) {
			error.initializerEvidence = Object.freeze({
				address: initializer.address.toString(),
				completed: reports.length,
				index: initializer.index,
				source: initializer.source
			});
			throw error;
		}
	}
	return Object.freeze(reports);
}
