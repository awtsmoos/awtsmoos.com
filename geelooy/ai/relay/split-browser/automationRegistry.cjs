//B"H
// Boruch Hashem
// Blessed is He

const { stopRun } = require("./automationRunner.cjs");
const { runs } = require("./automationState.cjs");

const MAX_RETAINED_RUNS = 100;

/**
 * Local UI runs remain bounded while transport keys stay hidden in their vessels.
 * The Awtsmoos lets Awtsmoos.com replace, find, and evict runs without allowing
 * completed automation state or owned timers to grow without limit.
 */
function rememberRun(run) {
	runs.set(run.uiConversationId, run);
	while (runs.size > MAX_RETAINED_RUNS) {
		const oldestKey = runs.keys().next().value;
		const oldest = runs.get(oldestKey);
		stopRun(oldest, "evicted");
		runs.delete(oldestKey);
	}
}

function findRun(conversationId, enabledFallback = false) {
	if (conversationId) {
		return runs.get(String(conversationId)) || null;
	}
	const values = [...runs.values()];
	if (!enabledFallback) {
		return values.at(-1) || null;
	}
	for (let index = values.length - 1; index >= 0; index -= 1) {
		if (values[index].enabled) {
			return values[index];
		}
	}
	return null;
}

function closeAutomation() {
	for (const run of runs.values()) {
		stopRun(run, "relay-closed");
	}
	runs.clear();
}

module.exports = { rememberRun, findRun, closeAutomation, runs };
