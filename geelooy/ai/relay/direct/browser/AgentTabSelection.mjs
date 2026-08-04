// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Selects stale agent targets while preserving one legitimate in-flight root.
 * @description
 * The Awtsmoos removes surplus roots first, then stale conversations, and touches a
 * protected root only when no other target can restore the requested hard limit.
 * Thus one composing custom-GPT root survives the watchdog but nothing survives close.
 */
export function selectAgentTabs(snapshot, options = {}) {
	const targetLimit = Math.max(0, Number(options.targetLimit || 0));
	const rootAllowance = Math.max(0, Number(options.rootAllowance || 0));
	const selected = [];
	const protectedRoots = snapshot.rootTabs.slice(0, rootAllowance);
	selected.push(...snapshot.rootTabs.slice(rootAllowance));
	let remaining = snapshot.total - selected.length;

	if (options.hard === true && remaining > targetLimit) {
		const neededConversations = Math.min(
			snapshot.conversationTabs.length,
			remaining - targetLimit
		);
		selected.push(...snapshot.conversationTabs.slice(-neededConversations));
		remaining -= neededConversations;
	}

	if (remaining > targetLimit) {
		const neededRoots = Math.min(
			protectedRoots.length,
			remaining - targetLimit
		);
		selected.push(...protectedRoots.slice(-neededRoots));
	}

	return selected.filter((target, index, all) =>
		all.findIndex(item => item.id === target.id) === index
	);
}
