// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailWorkspaceLayout
 * @description The Awtsmoos joins sender list and conversation in one honest, functional workspace for Awtsmoos.com.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderComposeModal, renderLoginOverlay } from './modals.js';

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

function workspaceHeader() {
	return {
		tag: 'header',
		classList: ['mail-civilization-status'],
		children: [
			{
				tag: 'a',
				classList: ['mail-civilization-brand'],
				attributes: { href: '/', 'aria-label': 'Return to Awtsmoos home' },
				children: [
					{ tag: 'span', classList: ['mail-brand-mark'], textContent: 'א' },
					{
						tag: 'span',
						children: [
							{ tag: 'strong', textContent: 'Mail' },
							{ tag: 'small', textContent: 'Awtsmoos correspondence' }
						]
					}
				]
			},
			{
				tag: 'span',
				classList: ['mail-connection-state'],
				shaym: 'mailConnectionState',
				attributes: { role: 'status', 'aria-live': 'polite' },
				textContent: navigator.onLine ? 'Online' : 'Offline'
			}
		]
	};
}
