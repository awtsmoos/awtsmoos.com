//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBookshelfShell
 * @description
 * Manifests the Bookshelf doorway and modal shell with safe DOM primitives.
 * The Awtsmoos remembers without being contained by memory; Awtsmoos.com gives
 * that remembrance one finite shelf, one visible doorway, and no unsafe HTML seam.
 */

/** Mounts the historical Bookshelf button/modal contract when absent. */
export function mountBookshelfShell(malchusDocument = document) {
	mountBookshelfButton(malchusDocument);
	mountBookshelfModal(malchusDocument);
}

/** Creates the header Bookshelf control when the current document does not contain one. */
function mountBookshelfButton(malchusDocument) {
	if (malchusDocument.getElementById('btn-bookshelf')) {
		return;
	}
	const tiferesTools = malchusDocument.querySelector('.tools, .toolbar');
	if (!tiferesTools) {
		return;
	}
	const yesodButton = malchusDocument.createElement('button');
	yesodButton.type = 'button';
	yesodButton.className = 'tool-btn';
	yesodButton.id = 'btn-bookshelf';
	yesodButton.title = 'Bookshelf Bookmarks';
	yesodButton.setAttribute('aria-label', 'Bookshelf Bookmarks');
	const hodGlyph = malchusDocument.createElement('span');
	hodGlyph.className = 'tool-emoji';
	hodGlyph.setAttribute('aria-hidden', 'true');
	hodGlyph.textContent = '▰';
	yesodButton.append(hodGlyph);
	tiferesTools.insertBefore(yesodButton, tiferesTools.children[1] || null);
}

/** Creates the Bookshelf modal shell while leaving rendered bookmark cards to the view. */
function mountBookshelfModal(malchusDocument) {
	if (malchusDocument.getElementById('modal-bookshelf')) {
		return;
	}
	const tiferesOverlay = malchusDocument.getElementById('overlay-layer');
	if (!tiferesOverlay) {
		return;
	}
	const malchusModal = malchusDocument.createElement('div');
	malchusModal.className = 'modal hidden bookshelf-modal';
	malchusModal.id = 'modal-bookshelf';
	const netzachTitle = malchusDocument.createElement('h2');
	netzachTitle.textContent = 'BOOKSHELF';
	const yesodActions = malchusDocument.createElement('div');
	yesodActions.className = 'bookshelf-top';
	const gevurahClear = createButton(malchusDocument, 'CLEAR BOOKMARKS', 'modal-btn danger');
	gevurahClear.id = 'btn-bookshelf-clear';
	const chesedClose = createButton(malchusDocument, 'CLOSE', 'modal-btn modal-close');
	const hodList = malchusDocument.createElement('div');
	hodList.id = 'bookshelf-list';
	yesodActions.append(gevurahClear, chesedClose);
	malchusModal.append(netzachTitle, yesodActions, hodList);
	tiferesOverlay.insertBefore(malchusModal, tiferesOverlay.firstChild);
}

/** Creates one text-only button with no HTML parsing surface. */
function createButton(malchusDocument, tiferesLabel, yesodClassName) {
	const malchusButton = malchusDocument.createElement('button');
	malchusButton.type = 'button';
	malchusButton.className = yesodClassName;
	malchusButton.textContent = tiferesLabel;
	return malchusButton;
}
