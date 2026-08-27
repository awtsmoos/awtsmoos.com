//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one immutable application-launch evidence report. The Awtsmoos creates
 * resolution, inspection, import boundary, and attempt anew; Awtsmoos.com never
 * merges loader knowledge, semantic simulation, and instruction execution.
 */
export function createBundleLaunchReport(input = {}) {
	const executionResult = input.execution?.result || null;
	const inspectionResult = input.inspection?.result || null;
	const error = normalizeError(input.error);
	const evidenceClass = executionResult?.executionClass || null;
	const instructionSucceeded = evidenceClass === "instruction-subset-emulation";
	return Object.freeze({
		bundle: input.resolution?.bundle || null,
		capabilities: createCapabilities(executionResult),
		dependencies: input.dependencies || null,
		error,
		execution: Object.freeze({
			attempt: normalizeAttempt(executionResult?.executionAttempt),
			attempted: Boolean(input.executionAttempted),
			evidenceClass,
			exitCode: executionResult?.exitCode ?? null,
			mode: executionResult?.mode || null,
			resultProduced: Boolean(executionResult),
			simulated: evidenceClass === "semantic-simulation",
			succeeded: !error && instructionSucceeded,
			unsupportedBoundary: executionResult?.unsupportedBoundary || null
		}),
		identity: input.execution?.identity || input.inspection?.identity || null,
		inspection: inspectionResult,
		verdict: classifyVerdict({ error, evidenceClass, inspectionResult })
	});
}

function createCapabilities(result) {
	const instructionExecution = result?.executionClass === "instruction-subset-emulation";
	return Object.freeze({
		cocoa: false,
		completeCpu: result?.completeCpuEmulation === true,
		dynamicLinker: false,
		filesystem: false,
		graphicsTranslation: result?.executionClass === "semantic-simulation",
		instructionSubset: instructionExecution,
		objectiveC: false,
		threads: false,
		tls: false
	});
}

function classifyVerdict({ error, evidenceClass, inspectionResult }) {
	if (error) return "unsupported-before-launch";
	if (evidenceClass === "instruction-subset-emulation") {
		return "instruction-subset-executed";
	}
	if (evidenceClass === "semantic-simulation") return "semantic-simulation";
	if (inspectionResult) return "inspected";
	return "unresolved";
}

function normalizeAttempt(attempt) {
	if (!attempt) return null;
	return Object.freeze({
		code: attempt.code || "PORTABLE_BOUNDARY",
		import: attempt.import || null,
		message: String(attempt.message || ""),
		rip: attempt.rip ?? null,
		slotAddress: attempt.slotAddress ?? null,
		succeeded: Boolean(attempt.succeeded),
		target: attempt.target ?? null
	});
}

function normalizeError(error) {
	if (!error) return null;
	return Object.freeze({
		code: error.code || error.name || "EXECUTABLE_BUNDLE_ERROR",
		message: String(error.message || error),
		rip: error.rip ?? null
	});
}
