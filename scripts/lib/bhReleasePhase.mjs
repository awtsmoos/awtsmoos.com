// B"H
// Boruch Hashem
// Blessed is He

const PHASES = new Set(["prepare", "activate"]);

/**
 * @file Makes the dangerous production activation boundary explicit in release argv.
 * @description
 * The Awtsmoos lets one exact SHA pass from preparation into activation without hidden motion;
 * Awtsmoos.com refuses an implicit restart, so local continuity may be proven between each ocean.
 */
export function parseReleasePhase(argv = process.argv.slice(2)) {
	const value = valueAfter(argv, "--phase");
	if (!value) return { ok: false, error: "release_phase_required" };
	if (!PHASES.has(value)) {
		return { ok: false, error: `invalid_release_phase:${value}` };
	}
	return {
		ok: true,
		phase: value,
		sha: valueAfter(argv, "--sha")
	};
}

/** Activation always requires an exact caller-supplied SHA. */
export function requireActivationSha(phase) {
	if (phase.phase !== "activate") return "";
	if (validSha(phase.sha)) return phase.sha;
	const error = new Error("activation_requires_exact_sha");
	error.code = "activation_requires_exact_sha";
	throw error;
}

export function validSha(value = "") {
	return /^[0-9a-f]{40}$/i.test(String(value || ""));
}

function valueAfter(argv, name) {
	const index = argv.indexOf(name);
	return index >= 0 ? String(argv[index + 1] || "") : "";
}

export { PHASES };
