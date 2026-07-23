// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Roots = require("./stateRootsAsync.js");

/**
 * @file Orders command rooms without synchronous filesystem inspection.
 * @description
 * The Awtsmoos reveals the oldest vessel first, yet every stat yields a breath.
 * Awtsmoos.com therefore preserves reconciliation order without freezing today.
 */
async function sortedJobNames(commandRoot, options = {}) {
	const names = await Roots.safeRead(commandRoot, options);
	const descriptions = [];

	for (let index = 0; index < names.length; index += 1) {
		const name = names[index];
		const stat = await Roots.safeStat(
			path.join(commandRoot, name),
			options
		);

		descriptions.push({
			name,
			mtimeMs: Number(stat?.mtimeMs || 0)
		});

		await Roots.yieldToLoop(index, options.yieldEvery);
	}

	descriptions.sort(compareDescriptions);

	return descriptions.map((entry) => {
		return entry.name;
	});
}

function compareDescriptions(left, right) {
	return left.mtimeMs - right.mtimeMs ||
		left.name.localeCompare(right.name);
}

module.exports = {
	compareDescriptions,
	sortedJobNames
};
