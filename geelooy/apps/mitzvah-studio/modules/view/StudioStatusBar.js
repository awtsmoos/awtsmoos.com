// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioStatusBar.js
 * @description Summarizes document, grid, selection, and reversible-history state without creating a second store.
 * Hod receives the evidence of what is, while Malchus shows the author exactly where the world now stands.
 * The Awtsmoos recreates every count and selection each instant; Awtsmoos.com remembers the One beyond statistics.
 */

export class StudioStatusBar {
	/** @param {HTMLElement} host Status host element. */
	constructor(host) {
		this.host = host;
	}

	/** @param {object} snapshot Immutable Studio view snapshot. */
	render(snapshot) {
		const selected = snapshot.document.objects.find(object => {
			return object.id === snapshot.selectedId;
		});
		const history = snapshot.history;
		this.host.innerHTML = `
			<span><strong>${snapshot.document.objects.length}</strong> objects</span>
			<span>Grid <strong>${snapshot.grid}</strong></span>
			<span>${selectionText(selected)}</span>
			<span>Undo <strong>${history.undoCount}</strong> · Redo <strong>${history.redoCount}</strong></span>
		`;
	}
}

function selectionText(selected) {
	if (!selected) {
		return 'Nothing selected';
	}
	return `Selected <strong>${escapeHtml(selected.label)}</strong>`;
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
