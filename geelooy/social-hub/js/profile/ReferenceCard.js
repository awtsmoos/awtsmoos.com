//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReferenceCard
 * @description
 * A graph edge reveals direction, kind, note, and exact source/target identities.
 * The Awtsmoos joins all ideas without distance while Awtsmoos.com preserves which
 * vessel points toward which canonical birthplace.
 */

import { textElement } from './CardElements.js';

export function referenceCard({ document, edge }) {
	const card = document.createElement('article');
	card.className = 'referenceCard riftCard';
	const title = textElement(
		document,
		'h3',
		`${edge.direction || 'graph'} ${edge.kind || 'reference'}`
	);
	const source = textElement(
		document,
		'pre',
		JSON.stringify({ from: edge.from, to: edge.to }, null, 2),
		'referenceCoordinates'
	);
	const note = textElement(
		document,
		'p',
		edge.note || 'Canonical graph relationship',
		'cardSummary'
	);
	card.append(title, note, source);
	return card;
}

export function roleCard({ document, record }) {
	const card = document.createElement('article');
	card.className = 'roleCard riftCard';
	card.append(
		textElement(document, 'strong', record.name || record.heichelId),
		textElement(document, 'p', record.role || record.relationship || 'member')
	);
	return card;
}

export function sharedActivityCard({ document, event }) {
	const card = document.createElement('article');
	card.className = 'sharedActivityCard riftCard';
	card.append(
		textElement(document, 'strong', event.title || event.action),
		textElement(document, 'p', event.path || 'Path redacted'),
		textElement(document, 'small', event.visibility?.mode || 'private')
	);
	return card;
}
