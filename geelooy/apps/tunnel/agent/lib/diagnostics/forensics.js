// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Bundle = require("./bundle.js");
const BuildInfo = require("../build-info.js");
const Redact = require("./redact.js");
const Retention = require("../history/retentionPlan.js");

/**
 * @file Captures a durable, redacted forensics bundle for every repair.
 * @description
 * When a repair claim settles, the repair ledger fires this capture off the
 * critical path: a redacted incident bundle labelled with the claim ID, linked
 * from the repair audit log. Capture runs asynchronously and can never block or
 * fail the repair itself — a bundle failure is reported, not raised.
 */

const MAX_BUNDLES = 20;

/**
 * Captures one forensics bundle for a settled repair. Never throws.
 * @param {object} args {claimId, outcome, evidence, options:{outputRoot, now}}
 * @returns {object} {ok, directory?, archive?, error?}
 */
function captureForRepair(args = {}) {
	try {
		const claimId = String(args.claimId || "").trim() || "unknown-claim";
		const options = args.options || {};
		const bundle = Bundle.create({
			...options,
			label: `repair-${claimId}`,
			provenance: BuildInfo.provenance(),
			extra: {
				repair: Redact.value({
					claimId,
					outcome: args.outcome,
					capturedAt: new Date(options.now || Date.now()).toISOString(),
					evidence: args.evidence || {}
				})
			}
		});
		pruneOldBundles(options.outputRoot);
		return { ok: true, directory: bundle.directory, archive: bundle.archive };
	} catch (error) {
		return { ok: false, error: String((error && error.message) || error) };
	}
}

/** Keeps only the newest MAX_BUNDLES incident directories. */
function pruneOldBundles(outputRoot) {
	if (!outputRoot) return;
	let entries = [];
	try {
		entries = fs.readdirSync(outputRoot, { withFileTypes: true })
			.filter(entry => entry.isDirectory() && entry.name.startsWith("incident-"))
			.map(entry => ({ name: entry.name, createdAt: createdMs(entry.name) }));
	} catch {
		return;
	}
	const plan = Retention.plan({
		records: entries.map(entry => ({ id: entry.name, createdAt: entry.createdAt, bytes: 0 })),
		maxCount: MAX_BUNDLES
	});
	for (const removed of plan.remove || []) {
		try {
			fs.rmSync(path.join(outputRoot, removed.id), { recursive: true, force: true });
		} catch {
			// Pruning is best-effort; a stuck directory never breaks forensics.
		}
	}
}

/** Sortable stamp inside incident-<stamp> directory names. */
function createdMs(name) {
	const stamp = String(name).replace(/^incident-/, "");
	const iso = stamp.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z");
	const ms = Date.parse(iso);
	return Number.isFinite(ms) ? ms : 0;
}

module.exports = {
	MAX_BUNDLES,
	captureForRepair,
	pruneOldBundles
};
