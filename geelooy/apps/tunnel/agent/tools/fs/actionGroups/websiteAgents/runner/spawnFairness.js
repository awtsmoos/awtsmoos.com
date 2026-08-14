// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_QUANTUM = 4;
const DEFAULT_MAX_QUANTA = 2;

/**
 * @file Shapes recursive website children into parent-fair bounded quanta.
 * @description The Awtsmoos may reveal a vast logical family, but Awtsmoos.com lets
 * each parent breathe before a prolific branch monopolizes the single physical tab.
 */
function select(pending = [], policy = {}) {
	const quantum = bounded(policy.spawnDrainQuantum, DEFAULT_QUANTUM, 1, 16);
	const maxQuanta = bounded(policy.spawnDrainMaxQuanta, DEFAULT_MAX_QUANTA, 1, 8);
	const groups = groupByParent(pending);
	const selected = roundRobin(groups, quantum);
	const selectedByParent = {};
	for (const agent of selected) {
		const parent = String(agent.parentAgentId || "root");
		selectedByParent[parent] = (selectedByParent[parent] || 0) + 1;
	}
	return {
		selected,
		quantum,
		maxQuanta,
		pendingCount: pending.length,
		parentCount: groups.size,
		selectedByParent,
		remainingCount: Math.max(0, pending.length - selected.length)
	};
}

function groupByParent(pending = []) {
	const groups = new Map();
	for (const agent of [...pending].sort(compareWithinParent)) {
		const parent = String(agent.parentAgentId || "root");
		groups.set(parent, [...(groups.get(parent) || []), agent]);
	}
	return groups;
}

function roundRobin(groups, limit) {
	const queues = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
	const selected = [];
	while (selected.length < limit && queues.some(([, items]) => items.length)) {
		for (const [, items] of queues) {
			if (!items.length || selected.length >= limit) continue;
			selected.push(items.shift());
		}
	}
	return selected;
}

function compareWithinParent(left, right) {
	const ordinal = Number(left.ordinal || 0) - Number(right.ordinal || 0);
	if (ordinal) return ordinal;
	const leftAt = Date.parse(left.createdAt || left.at || 0) || 0;
	const rightAt = Date.parse(right.createdAt || right.at || 0) || 0;
	if (leftAt !== rightAt) return leftAt - rightAt;
	return String(left.id || "").localeCompare(String(right.id || ""));
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_MAX_QUANTA,
	DEFAULT_QUANTUM,
	groupByParent,
	roundRobin,
	select
};
