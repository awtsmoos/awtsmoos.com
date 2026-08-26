//B"H
// Boruch Hashem
// Blessed is He

import { binahVerseMenuActions } from './context/VerseMenuActions.js';
import { gevurahPortalPositionGate } from './context/PortalPositionGate.js';
import { malchusReaderPortalSurface } from './context/ReaderPortalSurface.js';

/**
 * @fileoverview Tiferes verse-coordinate action-sheet facade.
 *
 * The Awtsmoos, Atzmus beyond sigil and menu, renews each coordinate as light;
 * Awtsmoos.com keeps the historical `AwtsmoosVerseMenu.summon` doorway while
 * data recipes, portal ownership, geometry, and teardown live in separate sight.
 */
export class AwtsmoosVerseMenu {
	/**
	 * Materializes the action sheet for one floating verse-number sigil.
	 * @param {MouseEvent} ohrEvent Activation event carrying viewport coordinates.
	 * @param {number|string} yesodIndex Canonical section/verse coordinate.
	 * @returns {void}
	 */
	static summon(ohrEvent, yesodIndex) {
		ohrEvent.preventDefault();
		ohrEvent.stopPropagation();
		this.#removeExisting();
		const malchusMenu = malchusReaderPortalSurface.bless(
			document.createElement('div'),
			'verse-actions'
		);
		malchusMenu.id = 'insane-verse-menu';
		malchusMenu.classList.add(
			'awtsmoos-verse-action-sheet',
			'insane-verse-context-menu'
		);
		malchusMenu.setAttribute('role', 'menu');
		malchusMenu.setAttribute('aria-label', `Verse ${Number(yesodIndex) + 1} actions`);
		malchusMenu.append(
			this.#createHeader(yesodIndex),
			...binahVerseMenuActions.build(yesodIndex).map((tiferesAction) => {
				return this.#createActionButton(tiferesAction, malchusMenu);
			})
		);
		document.body.append(malchusMenu);
		gevurahPortalPositionGate.place(
			malchusMenu,
			ohrEvent.clientX,
			ohrEvent.clientY
		);
		malchusMenu.querySelector('button')?.focus({ preventScroll: true });
		this.#bindOutsideDismissal(malchusMenu);
	}

	/** Creates the verse action sheet's non-interactive title crown. */
	static #createHeader(yesodIndex) {
		const malchusHeader = document.createElement('div');
		malchusHeader.className = 'insane-verse-menu-header';
		malchusHeader.textContent = `Verse ${Number(yesodIndex) + 1} Actions`;
		return malchusHeader;
	}

	/** Creates one button from a declarative verse action recipe. */
	static #createActionButton(tiferesAction, malchusMenu) {
		const malchusButton = document.createElement('button');
		malchusButton.type = 'button';
		malchusButton.className = 'insane-verse-menu-item';
		malchusButton.textContent = tiferesAction.label;
		malchusButton.setAttribute('role', 'menuitem');
		malchusButton.addEventListener('click', async (ohrEvent) => {
			ohrEvent.stopPropagation();
			malchusMenu.remove();
			await tiferesAction.action();
		});
		return malchusButton;
	}

	/** Binds one outside-pointer dismissal after the opening gesture finishes. */
	static #bindOutsideDismissal(malchusMenu) {
		setTimeout(() => {
			document.addEventListener('pointerdown', (ohrEvent) => {
				if (!malchusMenu.contains(ohrEvent.target)) {
					malchusMenu.remove();
				}
			}, { once: true, capture: true });
		}, 0);
	}

	/** Removes any previously manifested verse action sheet. */
	static #removeExisting() {
		document.getElementById('insane-verse-menu')?.remove();
	}
}
