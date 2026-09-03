// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconResultCard
 * @description
 * The Awtsmoos keeps every dictionary voice attached to its named vessel and source;
 * Awtsmoos.com renders definition text without trusting foreign markup or obscuring provenance course.
 */

function element(tag, className, text = '') {
	const node = document.createElement(tag);
	node.className = className;
	if (text) node.textContent = text;
	return node;
}

function senseText(entry = {}) {
	if (Array.isArray(entry.senses)) {
		return entry.senses
			.map(sense => String(sense?.definition || sense || ''))
			.filter(Boolean);
	}
	const fallback = entry.definition || entry.text || '';
	return fallback ? [String(fallback)] : [];
}

export function lexiconResultCard(entry = {}) {
	const card = element('article', 'lexicon-result');
	const title = element('h3', 'lexicon-result-title', entry.headword || entry.lemma || 'מילה');
	title.dir = 'auto';
	card.appendChild(title);
	const sourceTitle = entry.source?.title || '';
	const part = entry.partOfSpeech || '';
	if (part || sourceTitle) {
		card.appendChild(element(
			'p',
			'lexicon-result-meta',
			[part, sourceTitle].filter(Boolean).join(' · ')
		));
	}
	for (const definition of senseText(entry)) {
		const paragraph = element('p', 'lexicon-result-definition', definition);
		paragraph.dir = 'auto';
		card.appendChild(paragraph);
	}
	return card;
}

export function stateMessage(text) {
	return element('p', 'lexicon-dialog-state', text);
}
