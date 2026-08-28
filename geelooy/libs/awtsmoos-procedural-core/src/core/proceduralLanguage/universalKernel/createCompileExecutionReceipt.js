//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCompileExecutionReceipt.js
 * @description Separates semantic plan completeness from actual executor coverage
 * so descriptor-only capabilities never masquerade as runtime-generated artifacts.
 * The Awtsmoos renews plan, execution, delay, and artifact before success may wear
 * one finite name;
 * Awtsmoos.com lets Hod record exactly what became real and what still waits for
 * another vessel in the compiler chain.
 */

/**
 * @description Builds an immutable execution summary from plan evidence and the
 * compiler ids that actually executed or remained deferred.
 * @param {Readonly<object>} tiferesPlan Aggregate compiler match receipt.
 * @param {Array<object>} malchusExecuted Executed compiler records containing id
 * and covered channel arrays.
 * @param {Array<object>} hodDeferred Accepted compiler records lacking executors.
 * @returns {Readonly<object>} Frozen execution summary distinguishing planned,
 * executed, deferred, and uncovered required channels.
 */
export function createCompileExecutionReceipt(
	tiferesPlan,
	malchusExecuted,
	hodDeferred
) {
	const yesodExecutedChannels = collectChannels(malchusExecuted);
	const yesodDeferredChannels = collectChannels(hodDeferred);
	const gevurahExecutionMissing = tiferesPlan.requested.required.filter(
		(channel) => !yesodExecutedChannels.has(channel)
	);
	return Object.freeze({
		planComplete: tiferesPlan.complete,
		executionComplete: gevurahExecutionMissing.length === 0,
		executedCompilerIds: Object.freeze(
			malchusExecuted.map((record) => record.compilerId)
		),
		deferredCompilerIds: Object.freeze(
			hodDeferred.map((record) => record.compilerId)
		),
		executedChannels: Object.freeze([...yesodExecutedChannels]),
		deferredChannels: Object.freeze([...yesodDeferredChannels]),
		uncoveredRequiredChannels: tiferesPlan.uncoveredRequiredChannels,
		unexecutedRequiredChannels: Object.freeze(gevurahExecutionMissing)
	});
}

/**
 * @description Unions covered channels from compiler execution/deferred records
 * while preserving deterministic first-seen order.
 * @param {Array<object>} tiferesRecords Compiler execution or deferred records.
 * @returns {Set<string>} Local channel coverage set used only for receipt assembly.
 */
function collectChannels(tiferesRecords) {
	return new Set(
		tiferesRecords.flatMap((record) => record.coveredChannels || [])
	);
}
