// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Work-mode doctrine for append/end edits, shared infrastructure, generated files, and release proof.
 * @description
 * The Awtsmoos gives every kind of work its own boundary. Awtsmoos.com distinguishes
 * ordinary source custody from shared roots, generated artifacts, and deployment gates.
 */
const workModeInstructions = Object.freeze([
	instructionPack({
		id: "work.edit-position-integrity",
		summary: "When editing near the end, appending, or replacing a trailing section, inspect the entire file and preserve final structure, exports, and cleanup.",
		tags: ["work", "append", "tail", "position", "edit"],
		applies: { modes: ["append", "tail", "end"], taskHints: ["append", "end of file", "from end", "tail"] },
		instructions: [
			"Do not treat end-of-file work as permission for fragment insertion; read the complete file and rewrite it coherently.",
			"Inspect final exports, cleanup hooks, module closures, trailing comments, and newline conventions before changing the tail.",
			"If the desired addition reveals a new responsibility, extract a module rather than making the file's ending a miscellaneous dumping ground.",
			"After writing, re-read the final section and verify syntax/structure from the preceding scope through EOF."
		]
	}),
	instructionPack({
		id: "work.shared-infrastructure",
		summary: "Treat shared/global/base infrastructure as high blast-radius code: inspect consumers, scope behavior, and prove non-conflict before release.",
		tags: ["shared", "global", "base", "infrastructure", "risk"],
		applies: { pathHints: ["shared/", "common/", "core/", "base/"], taskHints: ["global", "shared", "base", "common"] },
		instructions: [
			"Trace all practical consumers and dependency direction before changing shared behavior.",
			"Prefer additive/local extension points over global mutation when one feature can own the behavior itself.",
			"For shared CSS or tokens, distinguish stable primitives from feature-specific presentation and prevent selector leakage.",
			"Run representative downstream regressions and document any compatibility or migration impact."
		]
	}),
	instructionPack({
		id: "work.generated-files",
		summary: "Do not hand-edit generated artifacts unless the generator contract explicitly requires it; change the source of truth and regenerate deterministically.",
		tags: ["generated", "bundle", "dist", "lock", "build"],
		applies: { pathHints: ["dist/", "build/", "generated/", "vendor/"], extensions: [".lock"] },
		instructions: [
			"Identify the generator, manifest, schema, or source module that owns the artifact before changing generated output.",
			"Regenerate through the documented deterministic path and verify hashes/content closure when the artifact participates in release integrity.",
			"Do not disguise a source bug by editing output that will be overwritten on the next build.",
			"If an artifact truly is manually maintained despite its location/name, document that exception explicitly."
		]
	}),
	instructionPack({
		id: "deploy.release-proof",
		summary: "Treat release/deploy as an evidence chain: clean source, deterministic build, immutable identity, activation, public reinstall, and live soak.",
		tags: ["deploy", "release", "install", "publish", "verify"],
		applies: { modes: ["deploy", "release"], taskHints: ["deploy", "release", "publish", "installer", "activate"] },
		instructions: [
			"Verify ancestry and staged-file scope before committing; unrelated dirty work must not enter the release.",
			"Build deterministically and record version, immutable source SHA, bundle/component hashes, and manifest closure.",
			"Activate the exact published SHA, then reinstall through the public production path rather than relying on local candidate bytes.",
			"Perform a live soak beyond historical failure thresholds and verify runtime identity, recovery seal, health, and key workflows."
		]
	}),
	instructionPack({
		id: "stability.self-healing-installer",
		summary: "Installer/recovery flows must repair missing or broken local runtime safely while preserving authenticated identity and independent emergency access.",
		tags: ["installer", "recovery", "self-heal", "identity"],
		applies: { taskHints: ["installer", "self heal", "missing local", "broken local", "recovery"] },
		instructions: [
			"A missing or corrupt ordinary runtime must not prevent downloading/verifying a fresh candidate through the signed/public installer path.",
			"Preserve saved device/tunnel identity unless explicit re-pairing is required; do not create identity churn as a repair strategy.",
			"Candidate readiness probing must tolerate bounded slow startup, distinguish connection-race from real boot failure, and never stop the healthy primary prematurely.",
			"If ordinary promotion fails, preserve an authenticated sealed emergency runtime that can reconnect independently and repair the primary."
		]
	})
]);

module.exports = { workModeInstructions };
