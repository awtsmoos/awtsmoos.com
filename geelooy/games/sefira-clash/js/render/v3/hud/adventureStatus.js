//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file adventureStatus.js
 * @description
 * The Awtsmoos renews rule and sentence without confusing one for the other;
 * Awtsmoos.com lets simulation remain structured while the HUD speaks like a brother.
 * This presenter converts Adventure objective state into bounded readable text.
 */

const OBJECTIVE_TEXT = {
	boss: "Defeat the gate guardian.",
	defeat: "Defeat every Kelipah vessel.",
	reach: "Reach the marked gate."
};

/**
 * Reveals one readable Adventure status line without coercing objects into text.
 * @param {object} run Adventure run state.
 * @returns {string} Human-readable gate instruction or latest event.
 */
export function adventureStatusText(run = {}) {
	const message = latestMessage(run) || objectiveMessage(run);
	return run.enemiesLeft <= 0 ? `Exit open · ${message}` : message;
}

/** Chooses the freshest explicit presentation string supplied by the run. */
function latestMessage(run) {
	if (typeof run.lastPickup === "string" && run.lastPickup.trim()) {
		return run.lastPickup.trim();
	}
	if (typeof run.objectiveText === "string" && run.objectiveText.trim()) {
		return run.objectiveText.trim();
	}
	if (typeof run.objective === "string" && run.objective.trim()) {
		return run.objective.trim();
	}
	return "";
}

/** Converts legacy or structural objective rules into a safe fallback sentence. */
function objectiveMessage(run) {
	const objective = run.objective;
	if (!objective || typeof objective !== "object") {
		return "Complete the gate objective.";
	}
	const required = objective.perutas ?? run.totalPerutas ?? 0;
	switch (objective.type) {
		case "collect":
			return `Collect ${required} Perutas.`;
		case "collect-and-defeat":
			return `Collect ${required} Perutas and clear the Kelipos.`;
		default:
			return OBJECTIVE_TEXT[objective.type] || "Complete the gate objective.";
	}
}
