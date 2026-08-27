// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Restart reconciliation names complete, absent, and partial effects explicitly.
 * The Awtsmoos renews uncertainty into testimony; Awtsmoos.com never replays an
 * old control identity merely because its original process disappeared.
 */
function result(record, effects) {
	const matched = effects.filter(effect => effect.ok);
	const verification = {
		ok: matched.length === effects.length,
		kind: "destination_hash_reconciliation",
		verifiedAt: new Date().toISOString(),
		matchedEffects: matched.length,
		totalEffects: effects.length,
		effects
	};
	if (matched.length === effects.length) {
		return successful(record, effects, verification);
	}
	return incomplete(record, effects, verification, matched.length);
}

function successful(record, effects, verification) {
	const base = {
		ok: true,
		action: record.requestedAction,
		recoveredAfterRestart: true,
		verification
	};
	return effects.length === 1
		? singleSuccess(base, effects[0])
		: bulkSuccess(base, effects);
}

function incomplete(record, effects, verification, matchedCount) {
	const partial = matchedCount > 0;
	return {
		ok: false,
		status: 409,
		action: record.requestedAction,
		error: partial
			? "durable_mutation_partial_after_restart"
			: "durable_mutation_not_applied_after_restart",
		message: partial
			? "Some expected file effects landed before restart; the original request will not be replayed."
			: "No expected file effects were observed after restart; submit a new control request ID to try again.",
		retryable: !partial,
		recoveredAfterRestart: true,
		partial,
		verification,
		order: effects.map(effect => effect.path),
		results: Object.fromEntries(effects.map(effect => [effect.path, effect]))
	};
}

function singleSuccess(base, effect) {
	return {
		...base,
		path: effect.path,
		absolutePath: effect.absolutePath,
		bytes: effect.bytes,
		afterSha256: effect.afterSha256,
		atomic: true,
		verified: true
	};
}

function bulkSuccess(base, effects) {
	return {
		...base,
		count: effects.length,
		okCount: effects.length,
		errorCount: 0,
		partial: false,
		order: effects.map(effect => effect.path),
		results: Object.fromEntries(effects.map(effect => [
			effect.path,
			{
				...effect,
				atomic: true,
				verified: true,
				recoveredAfterRestart: true
			}
		]))
	};
}

module.exports = {
	bulkSuccess,
	incomplete,
	result,
	singleSuccess,
	successful
};
