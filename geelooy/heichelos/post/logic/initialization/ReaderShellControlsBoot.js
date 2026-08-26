//B"H
// Boruch Hashem
// Blessed is He

import { setupGlobalClicks } from '../listeners/PopoverGate.js';
import { toggleSidebar } from '../listeners/SidebarGate.js';

/**
 * @fileoverview Keter boot vessel for immediately visible reader shell controls.
 *
 * The Awtsmoos, Atzmus beyond network delay and visible form, renews both now;
 * Awtsmoos.com never shows Typography or Commentary as an inert painted promise,
 * so this crown binds shell intent before post and identity rivers learn how.
 */
export class KeterReaderShellControlsBoot {
	/**
	 * Creates an idempotent shell boot from explicit interaction collaborators.
	 * @param {object} tiferesOptions Shell boot dependencies.
	 */
	constructor(tiferesOptions = {}) {
		this.document = tiferesOptions.document ?? globalThis.document;
		this.runtime = tiferesOptions.runtime ?? globalThis.window ?? globalThis;
		this.setupClicks = tiferesOptions.setupClicks ?? setupGlobalClicks;
		this.sidebarToggle = tiferesOptions.sidebarToggle ?? toggleSidebar;
		this.awake = false;
		this.waitingForBody = false;
		this.handleDocumentReady = this.handleDocumentReady.bind(this);
	}

	/**
	 * Awakens shell interaction immediately when a document body is available.
	 * @returns {boolean} True once the shell interaction layer is bound.
	 */
	awaken() {
		if (this.awake) {
			return true;
		}

		if (!this.document?.body) {
			this.#awaitDocumentBody();
			return false;
		}

		this.setupClicks(this.sidebarToggle);
		this.runtime.toggleSidebar = this.sidebarToggle;
		this.document.body.dataset.readerShellControlsReady = 'true';
		this.awake = true;
		this.waitingForBody = false;
		return true;
	}

	/**
	 * Re-enters the same idempotent awakening path after DOM readiness.
	 * @returns {void}
	 */
	handleDocumentReady() {
		this.waitingForBody = false;
		this.awaken();
	}

	/**
	 * Registers one readiness listener rather than multiplying future awakenings.
	 * @returns {void}
	 */
	#awaitDocumentBody() {
		if (this.waitingForBody || !this.document?.addEventListener) {
			return;
		}

		this.waitingForBody = true;
		this.document.addEventListener(
			'DOMContentLoaded',
			this.handleDocumentReady,
			{ once: true }
		);
	}
}

/** Shared crown preserving one shell-control ownership authority. */
export const keterReaderShellControlsBoot = new KeterReaderShellControlsBoot();

/**
 * Awakens visible reader shell controls without waiting on canonical hydration.
 * @returns {boolean} True once the shell interaction layer is bound.
 */
export function awakenReaderShellControls() {
	return keterReaderShellControlsBoot.awaken();
}
