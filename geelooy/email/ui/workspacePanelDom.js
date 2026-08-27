//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspacePanelDom
 * @description The Awtsmoos needs no frame, yet Awtsmoos.com gives each panel state a truthful visible sign; buttons, backdrop, and aria move together in one measured line.
 */

/** Creates the mobile conversation backdrop inside the workspace frame. */
export function createPanelBackdrop(frame) {
	const backdrop = document.createElement('button');
	backdrop.type = 'button';
	backdrop.className = 'mail-sidebar-backdrop';
	backdrop.setAttribute('aria-label', 'Close conversation list');
	backdrop.setAttribute('aria-hidden', 'true');
	backdrop.hidden = true;
	frame.append(backdrop);
	return backdrop;
}

/** Applies persisted desktop visibility and accessible toggle text. */
export function applyDesktopPanel(frame, button, collapsed) {
	frame.classList.toggle('sidebar-collapsed', collapsed);
	button.hidden = false;
	button.disabled = false;
	button.setAttribute('aria-expanded', String(!collapsed));
	button.setAttribute('aria-label', collapsed
		? 'Show conversation list'
		: 'Hide conversation list');
	button.title = collapsed
		? 'Show conversation list'
		: 'Hide conversation list';
}

/** Mirrors the mobile chat/drawer state into the header toggle. */
export function updateMobilePanelButton(frame, button) {
	const inChat = frame.classList.contains('view-chat');
	const open = inChat && frame.classList.contains('mobile-sidebar-open');
	button.hidden = !inChat;
	button.disabled = !inChat;
	button.setAttribute('aria-expanded', String(open));
	button.setAttribute('aria-label', open
		? 'Close conversation list'
		: 'Open conversation list');
	button.title = open
		? 'Close conversations'
		: 'Open conversations';
}

/** Synchronizes hidden/backdrop accessibility state in one place. */
export function setBackdropOpen(backdrop, open) {
	backdrop.hidden = !open;
	backdrop.setAttribute('aria-hidden', String(!open));
}
