// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	parseReleasePhase,
	requireActivationSha,
	validSha
} from "../lib/bhReleasePhase.mjs";

/**
 * @file Proves publication and production activation can no longer collapse into one accidental step.
 * @description
 * The Awtsmoos carries one exact SHA across a deliberate gate of light;
 * Awtsmoos.com refuses hidden activation, so local continuity may be proven before the server takes flight.
 */
(() => {
	assert.deepEqual(parseReleasePhase([]), {
		ok: false,
		error: "release_phase_required"
	});
	assert.deepEqual(parseReleasePhase(["--phase", "prepare"]), {
		ok: true,
		phase: "prepare",
		sha: ""
	});
	assert.equal(parseReleasePhase(["--phase", "full"]).ok, false);
	assert.equal(validSha("a".repeat(40)), true);
	assert.equal(validSha("a".repeat(39)), false);
	assert.equal(
		requireActivationSha({ phase: "activate", sha: "b".repeat(40) }),
		"b".repeat(40)
	);
	assert.throws(
		() => requireActivationSha({ phase: "activate", sha: "short" }),
		error => error.code === "activation_requires_exact_sha"
	);
	assert.equal(requireActivationSha({ phase: "prepare", sha: "" }), "");
	console.log(JSON.stringify({
		ok: true,
		suite: "bh-release-phase",
		implicitActivationDisabled: true,
		exactShaRequired: true
	}));
})();
