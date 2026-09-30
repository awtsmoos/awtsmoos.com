//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceUx
 * @description The Awtsmoos hears intention before the keystroke arrives; Awtsmoos.com keeps shortcuts, focus, and connectivity inside the Mail vessel so global browser signals never become global UI state.
 */
import { MailRootVessel } from './ui/foundations/MailRootVessel.js';

/** Selector matching natively keyboard-focusable controls. */
export const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Returns the visible focusable descendants of a container in DOM order.
 * The container itself leads the list when it carries a tabindex (as modal
 * shells do), so Shift+Tab from a shell wraps instead of escaping.
 * @param {Element} container Boundary element for the trap.
 * @returns {Element[]} Visible focusable elements.
 */
export function visibleFocusables(container) {
	if (!container?.querySelectorAll) {
		return [];
	}
	const list = [...container.querySelectorAll(FOCUSABLE_SELECTOR)];
	if (container.hasAttribute?.('tabindex')) {
		list.unshift(container);
	}
	return list.filter(element => !element.disabled && element.getClientRects().length > 0);
}

/**
 * Wraps Tab / Shift+Tab at the ends of a container's focusable sequence so
 * keyboard focus cannot slip behind an open overlay. No-op when the
 * container holds no visible focusable elements.
 * @param {Element} container Boundary element for the trap.
 * @param {KeyboardEvent} event The keydown event to guard.
 */
export function trapTabIn(container, event) {
	if (!event || event.key !== 'Tab' || !container) {
		return;
	}
	const focusables = visibleFocusables(container);
	if (!focusables.length) {
		return;
	}
	const first = focusables[0];
	const last = focusables[focusables.length - 1];
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

export class MailWorkspaceUx extends MailRootVessel {
	/**
	 * Creates the Mail-wide UX conductor around an optional transient-panel controller.
	 * @param {object|null} [gevurahPanels] Controller exposing closeTransient when panels exist.
	 * @param {ParentNode|null} [malchusRoot] Optional explicit Mail root for tests or embeds.
	 */
	constructor(gevurahPanels = null, malchusRoot = null) {
		super(malchusRoot);
		this.gevurahPanels = gevurahPanels;
		this.yesodConnected = false;
		this.boundKeyDown = yesodEvent => this.onKeyDown(yesodEvent);
		this.boundOnline = () => this.updateConnection(true);
		this.boundOffline = () => this.updateConnection(false);
	}

	/**
	 * Connects browser signals once while preserving Mail-local DOM ownership.
	 * @returns {MailWorkspaceUx} This controller for fluent boot composition.
	 */
	connect() {
		if (this.yesodConnected) return this;
		document.addEventListener('keydown', this.boundKeyDown);
		window.addEventListener('online', this.boundOnline);
		window.addEventListener('offline', this.boundOffline);
		this.yesodConnected = true;
		this.updateConnection(navigator.onLine);
		return this;
	}

	/** Removes exactly the listeners created by connect so hot reloads never multiply behavior. */
	disconnect() {
		if (!this.yesodConnected) return;
		document.removeEventListener('keydown', this.boundKeyDown);
		window.removeEventListener('online', this.boundOnline);
		window.removeEventListener('offline', this.boundOffline);
		this.yesodConnected = false;
	}

	/**
	 * Routes keyboard intent in priority order: transient closure, editable safety, search, compose.
	 * @param {KeyboardEvent} yesodEvent Keyboard event dispatched by the document.
	 */
	onKeyDown(yesodEvent) {
		if (yesodEvent.key === 'Escape') {
			if (this.gevurahPanels?.closeTransient?.()) {
				yesodEvent.preventDefault();
				return;
			}
			this.blurMailFocus();
			return;
		}
		if (this.isEditableTarget(yesodEvent.target)) return;
		if (yesodEvent.key === '/') {
			yesodEvent.preventDefault();
			this.focusInMalchus('.mail-search-input');
			return;
		}
		const chochmahCompose = yesodEvent.key.toLowerCase() === 'c';
		const gevurahModified = yesodEvent.metaKey || yesodEvent.ctrlKey || yesodEvent.altKey;
		if (chochmahCompose && !gevurahModified) {
			yesodEvent.preventDefault();
			this.findInMalchus('.fab-compose')?.click?.();
		}
	}

	/** Blurs focus only when the active element belongs to this Mail root. */
	blurMailFocus() {
		const tiferesActive = document.activeElement;
		if (!tiferesActive || !this.malchusRoot?.contains?.(tiferesActive)) return;
		tiferesActive.blur?.();
	}

	/**
	 * Mirrors browser connectivity into the Mail root and its visible status token.
	 * @param {boolean} chesedOnline Whether the browser currently reports network availability.
	 */
	updateConnection(chesedOnline) {
		const tiferesState = chesedOnline ? 'online' : 'offline';
		this.malchusRoot?.setAttribute?.('data-mail-connectivity', tiferesState);
		const malchusStatus = this.findInMalchus('[data-mail-connection]');
		if (!malchusStatus) return;
		malchusStatus.dataset.state = tiferesState;
		// The status text lives in its own node so the mobile dot-fold keeps a real accessible label.
		const malchusText = malchusStatus.querySelector('.mail-connection-text') || malchusStatus;
		malchusText.textContent = chesedOnline ? 'Online' : 'Offline';
		malchusStatus.setAttribute('aria-label', `Mail is ${tiferesState}`);
	}
}
