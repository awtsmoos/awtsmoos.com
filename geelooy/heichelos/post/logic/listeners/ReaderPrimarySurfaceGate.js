//B"H
// Boruch Hashem
// Blessed is He

import { tiferesTypographyGate } from './TiferesTypographyGate.js';

/**
 * @fileoverview Tiferes coordination between the reader's two major surfaces.
 *
 * The Awtsmoos, Atzmus beyond typography and commentary, renews both without
 * collision; Awtsmoos.com lets one primary transient chamber hold attention at
 * a time, then lets Escape return the reader to the trigger that opened it.
 */
export class TiferesReaderPrimarySurfaceGate {
	/**
	 * Creates coordination around an injected sidebar conduit and document vessel.
	 * @param {(forceState?: boolean|null) => boolean|void|null} yesodSidebarToggle Sidebar API.
	 * @param {Document|object|null} ohrDocument Document-like focus and trigger lookup vessel.
	 */
	constructor(
		yesodSidebarToggle = null,
		ohrDocument = globalThis.document ?? null
	) {
		this.sidebarToggle = yesodSidebarToggle;
		this.document = ohrDocument;
	}

	/**
	 * Replaces the sidebar conduit without rebinding global listeners.
	 * @param {(forceState?: boolean|null) => boolean|void} yesodSidebarToggle Sidebar API.
	 * @returns {void}
	 */
	connectSidebar(yesodSidebarToggle) {
		this.sidebarToggle = yesodSidebarToggle;
	}

	/** Activates commentary after releasing typography. */
	activateCommentary(ohrEvent) {
		this.#consume(ohrEvent);
		tiferesTypographyGate.close();
		this.sidebarToggle?.();
	}

	/** Activates typography after releasing commentary when opening. */
	activateTypography(ohrEvent) {
		this.#consume(ohrEvent);

		if (!tiferesTypographyGate.isOpen()) {
			this.sidebarToggle?.(false);
		}

		tiferesTypographyGate.toggle();
	}

	/** Closes typography when the target lives outside its trigger and panel. */
	closeTypographyOutside(ohrTarget) {
		if (!tiferesTypographyGate.contains(ohrTarget)) {
			tiferesTypographyGate.close();
		}
	}

	/**
	 * Releases whichever primary reader surface owns Escape and restores focus.
	 * @param {KeyboardEvent} ohrEvent Global Escape event.
	 * @returns {boolean} Whether the Sources surface was dismissed.
	 */
	handleEscape(ohrEvent) {
		tiferesTypographyGate.handleEscape(ohrEvent);

		const commentaryTrigger = this.document?.getElementById?.('commentaryBtn');
		const sidebarWasOpen = commentaryTrigger?.getAttribute?.('aria-expanded') === 'true';

		if (!sidebarWasOpen) {
			return false;
		}

		ohrEvent.preventDefault();
		this.sidebarToggle?.(false);
		commentaryTrigger.focus?.({ preventScroll: true });
		return true;
	}

	/** Prevents the activation click from falling into outside-click dismissal. */
	#consume(ohrEvent) {
		ohrEvent.preventDefault();
		ohrEvent.stopPropagation();
	}
}
