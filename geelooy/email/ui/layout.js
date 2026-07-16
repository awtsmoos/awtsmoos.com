// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailWorkspaceLayout
 * @description The Awtsmoos joins sender list and conversation without fake telemetry; Awtsmoos.com renders one honest communication workspace.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderComposeModal, renderLoginOverlay } from './modals.js';

/** Builds the responsive Mail workspace beneath the global Geelooy shell. */
export function renderAppLayout(ui, root) {
	renderLoginOverlay(ui, root);
	renderComposeModal(ui, root);
	ui.html({
		parent: root,
		tag: 'section',
		shaym: 'quantumMailShell',
		classList: ['mail-civilization-shell', 'geelooy-content-region'],
		attributes: { 'aria-label': 'Mail communication workspace' },
		children: [
			workspaceHeader(),
			{
				tag: 'div',
				shaym: 'appContainer',
				classList: ['app-container', 'mail-civilization-frame'],
				children: [
					{
						tag: 'aside',
						classList: ['sidebar', 'mail-civilization-sidebar'],
						shaym: 'sidebarPanel',
						attributes: { 'aria-label': 'Conversation list' },
						ready: element => renderSidebar(ui, element)
					},
					{
						tag: 'main',
						classList: ['chat-area', 'mail-civilization-chat'],
						shaym: 'chatPanel',
						attributes: { 'aria-label': 'Selected conversation' },
						ready: element => renderChat(ui, element)
					}
				]
			}
		]
	});
}

/** Describes only verifiable route state rather than invented system health. */
function workspaceHeader() {
	return {
		tag: 'header',
		classList: ['mail-civilization-status'],
		children: [
			{
				tag: 'div',
				classList: ['mail-civilization-brand'],
				children: [
					{ tag: 'strong', textContent: 'Geelooy Mail' },
					{ tag: 'small', textContent: 'Alias-aware messages and community correspondence' }
				]
			},
			{
				tag: 'span',
				classList: ['mail-connection-state'],
				shaym: 'mailConnectionState',
				attributes: { role: 'status', 'aria-live': 'polite' },
				textContent: navigator.onLine ? 'Browser online' : 'Browser offline'
			}
		]
	};
}
