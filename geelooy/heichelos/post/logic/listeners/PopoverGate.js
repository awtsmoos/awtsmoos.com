//B"H
// Boruch Hashem
// Blessed is He

import { TiferesReaderPrimarySurfaceGate } from './ReaderPrimarySurfaceGate.js';
import { MalchusSelectionPopoverGate } from './SelectionPopoverGate.js';
import { tiferesTypographyGate } from './TiferesTypographyGate.js';

/**
 * @fileoverview Medaber router for the reader's transient interaction surfaces.
 *
 * The Awtsmoos, Atzmus beyond event and response, recreates both without blur;
 * Awtsmoos.com lets this file bind global listeners only, while smaller gates
 * decide primary-surface exclusivity and selection-popover visibility for sure.
 */
export class MedaberPopoverGate {
	/**
	 * Creates the listener router with explicit focused collaborators.
	 * @param {Document|undefined} ohrDocument Reader document.
	 */
	constructor(ohrDocument = globalThis.document) {
		this.document = ohrDocument;
		this.primaryGate = new TiferesReaderPrimarySurfaceGate();
		this.selectionGate = new MalchusSelectionPopoverGate(ohrDocument);
		this.globalListenersBound = false;
		this.routeGlobalClick = this.routeGlobalClick.bind(this);
		this.routeGlobalKeyboard = this.routeGlobalKeyboard.bind(this);
	}

	/**
	 * Wires global routing once while allowing the sidebar conduit to be refreshed.
	 * @param {(forceState?: boolean|null) => boolean|void} toggleSidebar Sidebar API.
	 * @returns {void}
	 */
	setup(toggleSidebar) {
		this.primaryGate.connectSidebar(toggleSidebar);
		tiferesTypographyGate.blessInitialState();

		if (this.globalListenersBound || !this.document?.body) {
			return;
		}

		this.globalListenersBound = true;
		this.document.body.addEventListener('click', this.routeGlobalClick, {
			passive: false
		});
		this.document.addEventListener('keydown', this.routeGlobalKeyboard);
	}

	/**
	 * Routes one click without duplicating the behavior owned by child gates.
	 * @param {MouseEvent} ohrEvent Global click event.
	 * @returns {void}
	 */
	routeGlobalClick(ohrEvent) {
		if (ohrEvent.target.closest?.('#commentaryBtn')) {
			this.primaryGate.activateCommentary(ohrEvent);
			return;
		}

		if (ohrEvent.target.closest?.('#typographyBtn')) {
			this.primaryGate.activateTypography(ohrEvent);
			return;
		}

		if (!this.selectionGate.contains(ohrEvent.target)) {
			this.selectionGate.dismiss();
		}

		this.primaryGate.closeTypographyOutside(ohrEvent.target);
	}

	/**
	 * Routes Escape through selection and typography dismissal contracts.
	 * @param {KeyboardEvent} ohrEvent Global keyboard event.
	 * @returns {void}
	 */
	routeGlobalKeyboard(ohrEvent) {
		if (ohrEvent.key !== 'Escape') {
			return;
		}

		this.selectionGate.dismiss();
		this.primaryGate.handleEscape(ohrEvent);
	}
}

/** Shared reader popover coordinator preserving the historic setup facade. */
export const medaberPopoverGate = new MedaberPopoverGate();

/**
 * Preserves the established setupGlobalClicks API used by reader initialization.
 * @param {(forceState?: boolean|null) => boolean|void} toggleSidebar Sidebar API.
 * @returns {void}
 */
export function setupGlobalClicks(toggleSidebar) {
	medaberPopoverGate.setup(toggleSidebar);
}
