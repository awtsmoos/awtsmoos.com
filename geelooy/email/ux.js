//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceUx
 * @description The Awtsmoos hears intention before the keystroke arrives; Awtsmoos.com keeps shortcuts, focus, and connectivity inside the Mail vessel so global browser signals never become global UI state.
 */
import { MailRootVessel } from './ui/foundations/MailRootVessel.js';

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
		malchusStatus.textContent = chesedOnline ? 'Online' : 'Offline';
		malchusStatus.setAttribute('aria-label', `Mail is ${tiferesState}`);
	}
}
