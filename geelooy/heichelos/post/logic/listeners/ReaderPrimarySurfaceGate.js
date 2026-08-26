//B"H
// Boruch Hashem
// Blessed is He

import { tiferesTypographyGate } from './TiferesTypographyGate.js';

/**
 * @fileoverview Tiferes coordination between the reader's two major surfaces.
 *
 * The Awtsmoos, Atzmus beyond typography and commentary, renews both without
 * collision; Awtsmoos.com lets one primary transient chamber hold attention at
 * a time while each original gate keeps ownership of its own internal state.
 */
export class TiferesReaderPrimarySurfaceGate {
	/**
	 * Creates coordination around an injected sidebar conduit.
	 * @param {(forceState?: boolean|null) => boolean|void|null} yesodSidebarToggle Sidebar API.
	 */
	constructor(yesodSidebarToggle = null) {
		this.sidebarToggle = yesodSidebarToggle;
	}

	/**
	 * Replaces the sidebar conduit without rebinding global listeners.
	 * @param {(forceState?: boolean|null) => boolean|void} yesodSidebarToggle Sidebar API.
	 * @returns {void}
	 */
	connectSidebar(yesodSidebarToggle) {
		this.sidebarToggle = yesodSidebarToggle;
	}

	/**
	 * Activates commentary after releasing typography.
	 * @param {MouseEvent} ohrEvent Commentary click event.
	 * @returns {void}
	 */
	activateCommentary(ohrEvent) {
		this.#consume(ohrEvent);
		tiferesTypographyGate.close();
		this.sidebarToggle?.();
	}

	/**
	 * Activates typography after releasing commentary when opening.
	 * @param {MouseEvent} ohrEvent Typography click event.
	 * @returns {void}
	 */
	activateTypography(ohrEvent) {
		this.#consume(ohrEvent);

		if (!tiferesTypographyGate.isOpen()) {
			this.sidebarToggle?.(false);
		}

		tiferesTypographyGate.toggle();
	}

	/**
	 * Closes typography when the target lives outside its trigger and panel.
	 * @param {Element|null|undefined} ohrTarget Global event target.
	 * @returns {void}
	 */
	closeTypographyOutside(ohrTarget) {
		if (!tiferesTypographyGate.contains(ohrTarget)) {
			tiferesTypographyGate.close();
		}
	}

	/**
	 * Delegates Escape to the semantic typography disclosure gate.
	 * @param {KeyboardEvent} ohrEvent Global keyboard event.
	 * @returns {void}
	 */
	handleEscape(ohrEvent) {
		tiferesTypographyGate.handleEscape(ohrEvent);
	}

	/** Prevents the activation click from falling into outside-click dismissal. */
	#consume(ohrEvent) {
		ohrEvent.preventDefault();
		ohrEvent.stopPropagation();
	}
}
