//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MailWorkspacePanels
 * @description The Awtsmoos is beyond concealment and disclosure; Awtsmoos.com lets the conversation vessel contract, return, and restore focus without trapping a thumb, keyboard, or screen reader inside vanished space.
 */
import {
	createPanelBackdrop,
	applyDesktopPanel,
	setBackdropOpen,
	updateMobilePanelButton
} from './workspacePanelDom.js';
import {
	MAIL_DESKTOP_QUERY,
	bindMediaChange,
	readSidebarCollapse,
	writeSidebarCollapse
} from './workspacePanelState.js';
import { MailPanelFocusController } from './workspacePanelFocus.js';

export class MailWorkspacePanels {
	/** @param {object} ui Awtsmoos UI registry used to resolve rendered Mail elements. */
	constructor(ui) {
		this.ui = ui;
		this.frame = ui.getHtml('appContainer');
		this.button = ui.getHtml('mailSidebarToggle');
		this.desktop = window.matchMedia(MAIL_DESKTOP_QUERY);
		this.backdrop = this.frame ? createPanelBackdrop(this.frame) : null;
		this.focus = new MailPanelFocusController(this.button);
		this.unbindMedia = null;
		this.boundToggle = () => this.toggle();
		this.boundBackdrop = () => this.closeTransient();
		this.boundFrameClick = event => this.onFrameClick(event);
		this.boundSync = () => this.sync();
	}

	/** Connects responsive listeners exactly once and returns the active controller. */
	connect() {
		if (!this.frame || !this.button || !this.backdrop) return null;
		this.button.addEventListener('click', this.boundToggle);
		this.backdrop.addEventListener('click', this.boundBackdrop);
		this.frame.addEventListener('click', this.boundFrameClick);
		document.addEventListener('chat:enter', this.boundSync);
		document.addEventListener('chat:exit', this.boundSync);
		this.unbindMedia = bindMediaChange(this.desktop, this.boundSync);
		this.sync();
		return this;
	}

	/** Removes every listener installed by connect so remounts cannot multiply behavior. */
	disconnect() {
		this.button?.removeEventListener('click', this.boundToggle);
		this.backdrop?.removeEventListener('click', this.boundBackdrop);
		this.frame?.removeEventListener('click', this.boundFrameClick);
		document.removeEventListener('chat:enter', this.boundSync);
		document.removeEventListener('chat:exit', this.boundSync);
		this.unbindMedia?.();
	}

	/** Reconciles persisted desktop collapse or transient mobile drawer availability. */
	sync() {
		if (this.desktop.matches) {
			this.closeTransient(false);
			applyDesktopPanel(this.frame, this.button, readSidebarCollapse());
			return;
		}
		this.frame.classList.remove('sidebar-collapsed');
		this.closeTransient(false);
		updateMobilePanelButton(this.frame, this.button);
	}

	/** Toggles the persistent desktop rail or the transient mobile conversation drawer. */
	toggle() {
		if (this.desktop.matches) {
			const collapsed = !this.frame.classList.contains('sidebar-collapsed');
			writeSidebarCollapse(collapsed);
			applyDesktopPanel(this.frame, this.button, collapsed);
			return;
		}
		if (!this.frame.classList.contains('view-chat')) return;
		this.frame.classList.contains('mobile-sidebar-open')
			? this.closeTransient()
			: this.openMobile();
	}

	/** Reveals the mobile drawer and intentionally transfers focus into conversation search. */
	openMobile() {
		this.frame.classList.add('mobile-sidebar-open');
		setBackdropOpen(this.backdrop, true);
		updateMobilePanelButton(this.frame, this.button);
		this.focus.focusDrawer(this.ui.getHtml('mailSearchInput'));
	}

	/**
	 * Closes transient mobile state and optionally restores focus to the drawer's owning toggle.
	 * @param {boolean} [restoreFocus=true] Whether keyboard focus returns to the toggle.
	 * @returns {boolean} Whether a transient drawer was actually closed.
	 */
	closeTransient(restoreFocus = true) {
		const wasOpen = this.frame?.classList.contains('mobile-sidebar-open');
		this.frame?.classList.remove('mobile-sidebar-open');
		if (this.backdrop) setBackdropOpen(this.backdrop, false);
		if (!this.desktop.matches) updateMobilePanelButton(this.frame, this.button);
		if (wasOpen && restoreFocus) this.focus.restoreKeter();
		return Boolean(wasOpen);
	}

	/** @param {MouseEvent} event Click bubbling through the workspace frame. */
	onFrameClick(event) {
		if (!this.desktop.matches && event.target.closest('.thread-item')) {
			this.closeTransient(false);
		}
	}
}

/** @param {object} ui Awtsmoos UI registry. @returns {MailWorkspacePanels|null} Connected controller. */
export function connectWorkspacePanels(ui) {
	return new MailWorkspacePanels(ui).connect();
}
