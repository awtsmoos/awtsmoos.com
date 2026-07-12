// B"H
/**
 * @module QuantumMailLayout
 * @description
 * The December Quantum Mail deck returns without duplicating global navigation.
 * Working sender, chat, profile, modal, and API modules remain inside one frame.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderComposeModal, renderLoginOverlay } from './modals.js';

/** Builds the complete Quantum Mail frame beneath the unusual global header. */
export function renderAppLayout(ui, root) {
	renderLoginOverlay(ui, root);
	renderComposeModal(ui, root);
	ui.html({
		parent: root,
		tag: 'section',
		shaym: 'quantumMailShell',
		classList: ['mail-quantum-shell', 'geelooy-content-region'],
		attributes: { 'aria-label': 'Quantum communications deck' },
		children: [
			statusRail(),
			{
				tag: 'div',
				shaym: 'appContainer',
				classList: ['app-container', 'mail-quantum-frame'],
				children: [
					{ tag: 'aside', classList: ['sidebar', 'mail-quantum-sidebar'], shaym: 'sidebarPanel', ready: element => renderSidebar(ui, element) },
					{ tag: 'main', classList: ['chat-area', 'mail-quantum-chat'], shaym: 'chatPanel', ready: element => renderChat(ui, element) }
				]
			}
		]
	});
}

function statusRail() {
	return {
		tag: 'header',
		classList: ['mail-quantum-status'],
		children: [
			{ tag: 'span', classList: ['mail-status-light'], textContent: 'LIVE' },
			{ tag: 'strong', textContent: 'AWTSMOOS QUANTUM MAIL' },
			{ tag: 'small', textContent: 'alias-aware transmission network' },
			{ tag: 'span', classList: ['mail-status-code'], textContent: 'QMAIL // 002' }
		]
	};
}
