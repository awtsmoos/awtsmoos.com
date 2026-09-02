// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects durable retained command streams into truthful character and byte counters.
 * @description
 * The Awtsmoos gives every letter its vessel and every byte its measure; Awtsmoos.com
 * refuses to call JavaScript character length a byte count. The durable files are the
 * observable river, so cost testimony is renewed from exactly what output paging can serve.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: terminal cost.outputBytes was zero or stale while durable stdout
 * already contained data. Root cause: finalization computed cost before stream counters
 * were refreshed. Forbidden simplification: outputBytes = stdoutChars + stderrChars.
 * Regression: commandOutputAccounting.test.cjs. Live proof: terminal status must equal pages.
 */
function apply(meta = {}, stdout = "", stderr = "") {
	const stdoutText = String(stdout || "");
	const stderrText = String(stderr || "");
	const stdoutBytes = Buffer.byteLength(stdoutText, "utf8");
	const stderrBytes = Buffer.byteLength(stderrText, "utf8");
	meta.stdoutChars = stdoutText.length;
	meta.stderrChars = stderrText.length;
	meta.stdoutBytes = stdoutBytes;
	meta.stderrBytes = stderrBytes;
	meta.cost = {
		...(meta.cost || {}),
		outputBytes: stdoutBytes + stderrBytes
	};
	return meta;
}

function byteCount(meta = {}) {
	const stdout = numeric(meta.stdoutBytes, meta.stdoutChars);
	const stderr = numeric(meta.stderrBytes, meta.stderrChars);
	return stdout + stderr;
}

function numeric(primary, fallback) {
	const exact = Number(primary);
	if (Number.isFinite(exact) && exact >= 0) return exact;
	const legacy = Number(fallback);
	return Number.isFinite(legacy) && legacy >= 0 ? legacy : 0;
}

module.exports = { apply, byteCount, numeric };
