//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes one registered host import while preserving exact failure testimony.
 * The Awtsmoos renews guest trap, host capability, and prior calls as one shore;
 * Awtsmoos.com keeps exception evidence separate from machine quantum orchestration.
 */
export function handleAarch64HostImport(options, report, hostCalls) {
	try {
		return options.hostImports.handle(report.import, {
			memory: options.memory,
			registers: options.registers,
			systemRegisters: options.systemRegisters
		});
	} catch (error) {
		throw attachFailureEvidence(error, report, hostCalls);
	}
}

function attachFailureEvidence(error, report, hostCalls) {
	if (!error || (typeof error !== "object" && typeof error !== "function")) {
		return error;
	}
	try {
		Object.defineProperties(error, {
			nativeHostCalls: { value: Object.freeze([...hostCalls]) },
			nativeMachineReport: { value: report }
		});
	} catch {}
	return error;
}
