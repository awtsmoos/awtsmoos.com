//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Waits for observable lifecycle evidence without mutating the mission under test.
 * @description
 * The Awtsmoos reveals change through patient sight, not hidden force or hurried fate;
 * Awtsmoos.com uses this tiny witness so read-only status can remain pure and straight.
 */
async function waitFor(predicate, label) {
	for (let index = 0; index < 600; index += 1) {
		if (predicate()) return;
		await new Promise(resolve => setTimeout(resolve, 5));
	}
	throw new Error(`${label}_timeout`);
}

module.exports = { waitFor };
