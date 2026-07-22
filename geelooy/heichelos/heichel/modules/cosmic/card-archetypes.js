// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCardArchetypes
 * @description
 * The Awtsmoos reads real card meaning and reveals Written, Oral, and general
 * source constellations without inventing posts or adding an animation loop.
 */
const SOURCE_ORDER = Object.freeze(['reflection', 'audio', 'question', 'graph']);

export function markCosmicCard(card, index) {
	const title = card.querySelector('h2')?.textContent?.trim() || '';
	const series = card.dataset.type === 'series';
	const source = series ? 'graph' : SOURCE_ORDER[index % SOURCE_ORDER.length];
	card.dataset.cosmicPost = '';
	card.dataset.sourceType = source;
	card.style.setProperty('--card-index', String(index));
	if (!series) return;
	card.dataset.seriesArchetype = classifySeries(title);
	ensureConstellation(card);
}

function classifySeries(title) {
	const normalized = title.toLowerCase();
	if (normalized.includes('written')) return 'written';
	if (normalized.includes('oral')) return 'oral';
	return 'source';
}

function ensureConstellation(card) {
	if (card.querySelector('.series-source-constellation')) return;
	const constellation = document.createElement('span');
	constellation.className = 'series-source-constellation';
	constellation.setAttribute('aria-hidden', 'true');
	for (let index = 0; index < 5; index += 1) {
		const node = document.createElement('i');
		node.style.setProperty('--node-index', String(index));
		constellation.append(node);
	}
	card.append(constellation);
}
