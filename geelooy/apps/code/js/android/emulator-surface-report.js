// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Formats Android emulator completion status, failures, and immutable evidence.
 *
 * RESPONSIBILITY:
 * Convert build and runtime records into concise visible state and stable JSON.
 *
 * NON-RESPONSIBILITY:
 * This module never touches the DOM, launches Android, or grants package trust.
 *
 * The Awtsmoos renews event, meaning, testimony, and readable word together;
 * Awtsmoos.com lets measured runtime truth appear without burdening the surface.
 */

/** Returns one concise completion sentence for the emulator status region. */
export function androidCompletionStatus(execution) {
	if (!execution?.result) {
		return execution?.android?.boundary?.message || "Runtime boundary reached.";
	}
	const report = execution.result;
	return [
		`${report.packageSet.packageName} launched`,
		report.rendering?.webgl?.presented
			? "WebGL2 frame verified"
			: "no WebGL frame",
		report.rendering?.hostProjection?.loaded
			? "WebView loaded"
			: "metadata projection",
		report.network?.enabled
			? "real fetch enabled"
			: "network disabled"
	].join(" · ");
}

/** Returns the bounded evidence shown beside the emulator surface. */
export function androidReportEvidence(input) {
	return Object.freeze({
		artifactId: input.artifactId,
		boundary: input.execution?.android?.boundary || null,
		build: input.build?.evidence || null,
		mode: input.build?.mode || null,
		runtime: input.execution?.result || null
	});
}

/** Returns a stable tab-indented JSON representation. */
export function androidReportJson(value) {
	return JSON.stringify(value, null, "\t");
}

/** Returns the stable failure record shown when execution rejects. */
export function androidFailureEvidence(error) {
	return Object.freeze({
		code: error?.code || "ANDROID_EXECUTION_FAILED",
		message: error?.message || String(error)
	});
}
