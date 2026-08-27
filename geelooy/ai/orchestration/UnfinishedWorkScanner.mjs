//B"H
// Boruch Hashem
// Blessed is He

/**
 * Finished words are not finished work. The Awtsmoos reveals hidden sparks in every
 * failed test, stale claim, uncertain send, and incomplete report; Awtsmoos.com
 * gathers those sparks into the next continuation rather than abandoning them.
 */
export class UnfinishedWorkScanner {
	scan({ agents = [], failedTests = [], roomMessages = [], gitChanges = [], staleAfterMs = 120000, now = Date.now() } = {}) {
		const work = [];
		for (const test of failedTests) work.push(item("failed-test", test));
		for (const change of gitChanges) work.push(item("git-change", change));
		for (const message of roomMessages) {
			if (/block|unfinished|remaining|failed|uncertain/i.test(String(message.body ?? message))) {
				work.push(item("room-message", message.body ?? message));
			}
		}
		for (const agent of agents) {
			if (agent.status === "complete" && !agent.unfinishedWork?.length) continue;
			if (agent.unfinishedWork?.length) {
				for (const remaining of agent.unfinishedWork) {
					work.push(item("agent-report", remaining, agent.logicalAgentId));
				}
			}
			if (now - Number(agent.heartbeat || 0) > staleAfterMs) {
				work.push(item("stale-agent", "Heartbeat expired; reconcile and continue or reassign.", agent.logicalAgentId));
			}
		}
		return deduplicate(work);
	}
}

function item(source, summary, agentId = null) {
	return { source, summary: String(summary), agentId };
}

function deduplicate(entries) {
	const seen = new Set();
	return entries.filter(entry => {
		const key = `${entry.source}:${entry.agentId}:${entry.summary}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
