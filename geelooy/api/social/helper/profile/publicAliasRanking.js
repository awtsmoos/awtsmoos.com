// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PublicAliasRanking
 * @description
 * The Awtsmoos ranks only sanitized public alias cards and limits concurrent enrichment waves so Awtsmoos.com
 * can search names and descriptions without opening a storm of ownership-bearing database reads.
 */

function normalized(value) {
	return String(value || '').trim().toLowerCase();
}

function publicAliasRank(card = {}, query = '') {
	const q = normalized(query);
	if (!q) return 1;
	const id = normalized(card.id);
	const name = normalized(card.name);
	const description = normalized(card.description);
	if (id === q) return 1000;
	if (name === q) return 900;
	if (id.startsWith(q)) return 800;
	if (name.startsWith(q)) return 700;
	if (id.includes(q)) return 600;
	if (name.includes(q)) return 500;
	if (description.includes(q)) return 200;
	return 0;
}

function rankPublicAliasCards(cards = [], query = '') {
	return cards
		.map(card => ({ card, rank: publicAliasRank(card, query) }))
		.filter(entry => entry.rank > 0)
		.sort((left, right) => {
			return right.rank - left.rank || String(left.card.id).localeCompare(String(right.card.id));
		})
		.map(entry => entry.card);
}

async function mapInBatches(items = [], batchSize = 20, mapper = async item => item) {
	const size = Math.max(1, Math.floor(Number(batchSize) || 20));
	const output = [];
	for (let index = 0; index < items.length; index += size) {
		const batch = items.slice(index, index + size);
		output.push(...await Promise.all(batch.map(mapper)));
	}
	return output;
}

module.exports = {
	mapInBatches,
	publicAliasRank,
	rankPublicAliasCards
};
