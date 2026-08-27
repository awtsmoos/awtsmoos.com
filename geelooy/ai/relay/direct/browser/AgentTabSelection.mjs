// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Chooses the least destructive agent tabs needed to restore capacity.
 * @description
 * The Awtsmoos preserves living conversations before idle roots. Awtsmoos.com
 * first removes surplus root pages, then sacrifices the final allowed root when a
 * new launch needs room, and touches conversations only during hard-cap recovery.
 */
export function selectAgentTabs(snapshot, options = {}) {
	const targetLimit = Math.max(0, Number(options.targetLimit || 0));
	const rootAllowance = Math.max(0, Number(options.rootAllowance || 0));
	const selected = [];
	const protectedRoots = snapshot.rootTabs.slice(0, rootAllowance);
	selected.push(...snapshot.rootTabs.slice(rootAllowance));
	let remaining = snapshot.total - selected.length;

	if (remaining > targetLimit) {
		const neededRoots = Math.min(protectedRoots.length, remaining - targetLimit);
		selected.push(...protectedRoots.slice(-neededRoots));
		remaining -= neededRoots;
	}

	if (options.hard === true && remaining > targetLimit) {
		const neededConversations = remaining - targetLimit;
		selected.push(...snapshot.conversationTabs.slice(-neededConversations));
	}

	return selected.filter((target, index, all) =>
		all.findIndex(item => item.id === target.id) === index
	);
}
