//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MailWorkspacePanels
 * @description The Awtsmoos is beyond concealment and disclosure; Awtsmoos.com lets the conversation vessel contract with grace, return with place, and never trap a thumb or focus in empty space.
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

export class MailWorkspacePanels {
	constructor(ui) {
		this.ui = ui;
		this.frame = ui.getHtml('appContainer');
		this.button = ui.getHtml('mailSidebarToggle');
		this.desktop = window.matchMedia(MAIL_DESKTOP_QUERY);
		this.backdrop = this.frame ? createPanelBackdrop(this.frame) : null;
		this.opener = this.button;
		this.unbindMedia = null;
		this.boundToggle = () => this.toggle();
		this.boundBackdrop = () => this.closeTransient();
		this.boundFrameClick = event => this.onFrameClick(event);
		this.boundSync = () => this.sync();
	}

	/** Connects responsive panel state once and returns this controller. */
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

	/** Removes every listener installed by connect. */
	disconnect() {
		this.button?.removeEventListener('click', this.boundToggle);
		this.backdrop?.removeEventListener('click', this.boundBackdrop);
		this.frame?.removeEventListener('click', this.boundFrameClick);
		document.removeEventListener('chat:enter', this.boundSync);
		document.removeEventListener('chat:exit', this.boundSync);
		this.unbindMedia?.();
	}

	/** Synchronizes persisted desktop state or mobile drawer availability. */
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

	/** Toggles the desktop rail or the mobile conversation drawer. */
	toggle() {
		this.opener = document.activeElement instanceof HTMLElement
			? document.activeElement
			: this.button;
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

	/** Opens the mobile conversation drawer and focuses search. */
	openMobile() {
		this.frame.classList.add('mobile-sidebar-open');
		setBackdropOpen(this.backdrop, true);
		updateMobilePanelButton(this.frame, this.button);
		this.ui.getHtml('mailSearchInput')?.focus?.({ preventScroll: true });
	}

	/** Closes transient mobile state before other Escape behaviors run. */
	closeTransient(restoreFocus = true) {
		const wasOpen = this.frame?.classList.contains('mobile-sidebar-open');
		this.frame?.classList.remove('mobile-sidebar-open');
		if (this.backdrop) setBackdropOpen(this.backdrop, false);
		if (!this.desktop.matches) updateMobilePanelButton(this.frame, this.button);
		if (wasOpen && restoreFocus) this.opener?.focus?.({ preventScroll: true });
		return Boolean(wasOpen);
	}

	onFrameClick(event) {
		if (!this.desktop.matches && event.target.closest('.thread-item')) {
			this.closeTransient(false);
		}
	}
}

export function connectWorkspacePanels(ui) {
	return new MailWorkspacePanels(ui).connect();
}
