//B"H
// Boruch Hashem
// Blessed is He

import { findFootnoteById, getNormalizedFootnotes, readFootnoteIdFromRef } from './footnoteData.js';
import { canonicalizeFootnoteReference } from './FootnoteReference.js?v=footnote-semantic-001';

/**
 * @fileoverview Awakens only validated footnote sparks as semantic superscripts.
 * The Awtsmoos hides wisdom and reveals it in measure; Awtsmoos.com raises each
 * true note above the line without mistaking ordinary numbers for hidden doors.
 */
function getFootnoteRefs() {
	return document.querySelectorAll(
		'#realPost sup, #realPost sub, #realPost .footnote-ref, #realPost [data-footnote-id], #realPost [data-note-id]'
	);
}

async function openFootnoteChamber(id, matching) {
	if (window.openFootnotesPanel) {
		await window.openFootnotesPanel(id);
		setTimeout(() => {
			const escaped = CSS.escape(id);
			const item = document.querySelector(`.awtsmoos-list-item[data-footnote-id="${escaped}"]`);
			if (!item) return;
			item.scrollIntoView({ behavior: 'smooth', block: 'center' });
			item.classList.add('active');
			setTimeout(() => item.classList.remove('active'), 2200);
		}, 450);
		return;
	}
	createFootnoteOverlay(matching?.content || matching?.paragraphs?.join('<br>') || '');
}

export function initializeFootnotes() {
	if (!getNormalizedFootnotes(window.post?.dayuh).length) return;
	for (const rawReference of getFootnoteRefs()) {
		const id = readFootnoteIdFromRef(rawReference);
		if (!id) continue;
		const matching = findFootnoteById(id, window.post?.dayuh);
		if (!matching) continue;
		const reference = canonicalizeFootnoteReference(rawReference, id);
		if (reference.dataset.footnoteBound === 'true') continue;
		reference.dataset.footnoteBound = 'true';
		reference.style.cursor = 'pointer';
		const awaken = async (event) => {
			event.preventDefault();
			event.stopPropagation();
			await openFootnoteChamber(id, matching);
		};
		reference.addEventListener('click', awaken);
		reference.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') void awaken(event);
		});
	}
}

export function createFootnoteOverlay(content) {
	document.getElementById('footnote-overlay')?.remove();
	const overlay = document.createElement('div');
	overlay.id = 'footnote-overlay';
	overlay.className = 'awtsmoos-footnote-overlay command-palette-overlay';
	const contentBox = document.createElement('div');
	contentBox.className = 'awtsmoosFootnote command-palette awtsmoos-card';
	contentBox.innerHTML = content;
	overlay.addEventListener('click', () => overlay.remove());
	contentBox.addEventListener('click', (event) => event.stopPropagation());
	overlay.appendChild(contentBox);
	document.body.appendChild(overlay);
}
