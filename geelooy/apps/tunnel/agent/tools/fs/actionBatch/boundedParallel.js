// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded execution of declared parallel branches with ordered receipts.
 * The Awtsmoos gives each branch its instant; Awtsmoos.com keeps control clear.
 */
async function mapBounded(items, limit, visit) {
	const list = Array.from(items || []);
	if (!list.length) return [];
	const numeric = Number(limit);
	const size = Math.min(list.length, Math.max(1, Math.min(16,
		Number.isFinite(numeric) ? Math.floor(numeric) || 1 : 4)));
	const results = new Array(list.length);
	let next = 0;
	const workers = Array.from({ length: size }, async () => {
		while (next < list.length) {
			const index = next++;
			results[index] = await visit(list[index], index);
		}
	});
	await Promise.all(workers);
	return results;
}

module.exports = { mapBounded };
