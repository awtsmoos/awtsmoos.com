// B"H
// Boruch Hashem
// Blessed is He

const MUTATION_ACTIONS = new Set([
	"applyPatch",
	"bulkWrite",
	"bulkWriteIfHashes",
	"copyFile",
	"copyTree",
	"deleteFile",
	"deleteTree",
	"ensureFile",
	"insertAfterFunction",
	"insertAfterScope",
	"insertBeforeFunction",
	"insertBeforeScope",
	"mkdirp",
	"moveFile",
	"moveTree",
	"replaceFunction",
	"replaceFunctionBody",
	"replaceMethod",
	"replaceRange",
	"replaceScope",
	"replaceScopeBody",
	"replaceSymbol",
	"touch",
	"write",
	"writeIfHash"
]);

/**
 * @file Names mutation intent without pretending requested intent equals manifested execution.
 * @description
 * The Awtsmoos distinguishes a plan from a deed and a deed from its proof. Awtsmoos.com
 * carries the caller's dry-run and confirmation covenant into durable relay history so
 * later observers can see whether execution was requested without guessing from success text.
 */
function fromPayload(payload = {}, action = "") {
	const mutation = MUTATION_ACTIONS.has(String(action || ""));
	if (!mutation) return { mutation: false };
	const dryRun = booleanOrNull(payload.dryRun);
	const confirm = booleanOrNull(payload.confirm);
	const durableRequested = dryRun === false && confirm === true;
	return {
		mutation: true,
		dryRun,
		confirm,
		durableRequested,
		previewRequested: dryRun !== false,
		mutationMode: modeFor({ dryRun, confirm, durableRequested })
	};
}

/** Returns a bounded semantic mode that never claims the mutation actually executed. */
function modeFor(intent = {}) {
	if (intent.durableRequested) return "durable_execution_requested";
	if (intent.dryRun !== false) return "preview_requested";
	return intent.confirm === true
		? "execution_requested"
		: "execution_requested_without_explicit_confirmation";
}

function booleanOrNull(value) {
	return typeof value === "boolean" ? value : null;
}

module.exports = {
	MUTATION_ACTIONS,
	fromPayload,
	modeFor
};
