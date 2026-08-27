// B"H
// Boruch Hashem
// Blessed is He

/** Restores legacy compound-action carriers without weakening action permissions. */
function normalize(payload = {}) {
	const carried = payload.actions;
	if (payload.action === "bulk" && Array.isArray(carried) && !payload.files) {
		return {
			...payload,
			action: "actionBatch",
			requestAction: "actionBatch",
			requestedAction: "actionBatch",
			compatibilityAlias: "bulk_actionsJson_to_actionBatch",
			steps: carried
		};
	}
	if (payload.action === "actionBatch" && Array.isArray(carried)) {
		return { ...payload, steps: carried };
	}
	if (payload.action === "commandTreeRun" && carried && !Array.isArray(carried)) {
		return {
			...payload,
			steps: carried.steps || payload.steps,
			vars: carried.vars || payload.vars,
			budgetPerutas: carried.budgetPerutas ?? payload.budgetPerutas
		};
	}
	return payload;
}

module.exports = { normalize };
