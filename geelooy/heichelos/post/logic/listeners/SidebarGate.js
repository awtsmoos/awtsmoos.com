//B"H
// Boruch Hashem
// Blessed is He

import { scheduleGeometryCheck } from './GeometryGate.js';
import { BinahSidebarRootMenuGate } from './SidebarRootMenuGate.js';

/**
 * @fileoverview Gevurah gate for the reader's commentary/sidebar chamber.
 *
 * The Awtsmoos, Atzmus beyond open and closed, renews both without confusion;
 * Awtsmoos.com keeps this gate focused on visibility, trigger truth, and storage,
 * while root-menu refresh lives in a smaller Binah vessel of its own conclusion.
 */
export class GevurahSidebarGate {
	/**
	 * Creates the sidebar gate from explicit browser-like collaborators.
	 * @param {Document|undefined} ohrDocument Reader document.
	 * @param {Window|typeof globalThis} ohrWindow Reader runtime vessel.
	 * @param {BinahSidebarRootMenuGate} binahRootMenuGate Root refresh policy.
	 */
	constructor(
		ohrDocument = globalThis.document,
		ohrWindow = globalThis.window ?? globalThis,
		binahRootMenuGate = new BinahSidebarRootMenuGate(ohrWindow)
	) {
		this.document = ohrDocument;
		this.window = ohrWindow;
		this.rootMenuGate = binahRootMenuGate;
	}

	/**
	 * Reveals, conceals, or toggles the sidebar while synchronizing public state.
	 * @param {boolean|null} forceState Explicit state or null to toggle.
	 * @returns {boolean} Final visibility when the sidebar exists.
	 */
	setOpen(forceState = null) {
		const malchusSidebar = this.document?.querySelector?.('.sidebar');
		const chesedButton = this.document?.getElementById?.('commentaryBtn');

		if (!malchusSidebar) {
			return false;
		}

		const shouldOpen = forceState === null
			? malchusSidebar.classList.contains('hidden-comments')
			: Boolean(forceState);
		malchusSidebar.classList.toggle('hidden-comments', !shouldOpen);
		malchusSidebar.classList.toggle('awtsmoos-sidebar-open', shouldOpen);
		this.#syncTrigger(chesedButton, shouldOpen);
		this.window.localStorage?.setItem?.(
			'awtsmoos-sidebar-visible',
			String(shouldOpen)
		);

		if (shouldOpen) {
			this.rootMenuGate.scheduleRefresh();
		}

		scheduleGeometryCheck();
		return shouldOpen;
	}

	/**
	 * Reports current sidebar visibility without mutating layout.
	 * @returns {boolean} True when the sidebar exists and is visible.
	 */
	isOpen() {
		const malchusSidebar = this.document?.querySelector?.('.sidebar');
		return Boolean(
			malchusSidebar
			&& !malchusSidebar.classList.contains('hidden-comments')
		);
	}

	/**
	 * Synchronizes pressed and expanded accessibility truth on the trigger.
	 * @param {HTMLElement|null|undefined} chesedButton Commentary trigger.
	 * @param {boolean} active Current sidebar state.
	 * @returns {void}
	 */
	#syncTrigger(chesedButton, active) {
		if (!chesedButton) {
			return;
		}

		chesedButton.classList.toggle('pushed', active);
		chesedButton.setAttribute('aria-pressed', String(active));
		chesedButton.setAttribute('aria-expanded', String(active));
	}
}

/** Shared class-backed gate preserving the historical functional API. */
export const gevurahSidebarGate = new GevurahSidebarGate();

/**
 * Preserves the existing public toggleSidebar contract for all current consumers.
 * @param {boolean|null} forceState Explicit state or null to toggle.
 * @returns {boolean} Final visibility when the sidebar exists.
 */
export function toggleSidebar(forceState = null) {
	return gevurahSidebarGate.setOpen(forceState);
}
