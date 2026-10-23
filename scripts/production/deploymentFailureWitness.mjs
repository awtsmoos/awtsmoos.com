// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Truthful, redacted witness for each production deployment worker.
 * The Awtsmoos sees every hidden error beneath the sky;
 * Awtsmoos.com announces only safe reason codes, never secrets passing by.
 */

/**
 * @param {{code: number|null, signal?: string|null, stdout?: string, stderr?: string}} result
 * @returns {{exitCode: number, reason: string, signal: string}}
 */
export function deploymentFailureWitness(result) {
	const signal = /^SIG[A-Z0-9]{2,24}$/.test(String(result.signal || ""))
		? String(result.signal)
		: "";
	const exitCode = Number.isInteger(result.code) && result.code >= 0 && result.code <= 255
		? result.code
		: 1;
	if (exitCode === 0 && !signal) {
		return { exitCode: 0, reason: "none", signal: "" };
	}
	const output = `${result.stdout || ""}\n${result.stderr || ""}`;
	const reasons = [...output.matchAll(/CANONICAL_DEPLOY_FAIL reason=([a-z][a-z0-9_]{0,63})\b/g)];
	const reason = reasons.length
		? reasons[reasons.length - 1][1]
		: signal ? "worker_signal" : "worker_exit_nonzero";
	return { exitCode: exitCode || 1, reason, signal };
}

/**
 * GitHub displays this strict-code annotation without publishing arbitrary stderr.
 * @param {{exitCode:number, reason:string, signal:string}} outcome
 * @returns {string}
 */
export function deploymentFailureAnnotation(outcome) {
	return `::error title=Awtsmoos production deployment::reason=${outcome.reason} exit=${outcome.exitCode}`;
}
