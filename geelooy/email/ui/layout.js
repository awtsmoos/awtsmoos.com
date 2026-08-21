//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceLayout
 * @description The Awtsmoos joins list and letter inside one measured workspace; Awtsmoos.com gives each region clear scroll ownership while small modules reveal the frame without becoming a monolith.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderComposeModal, renderLoginOverlay } from './modals.js';
import { connectMalchusNavigation } from './malchusNavigation.js';
import { connectWorkspacePanels } from './workspacePanels.js';
import { workspaceHeader } from './layoutHeader.js';

/** Renders Mail and returns its transient-panel controller for lifecycle wiring. */
export function renderAppLayout(ui, root) {
	renderLoginOverlay(ui, root);
	renderComposeModal(ui, root);
	ui.html({
		parent: root,
		tag: 'section',
		shaym: 'quantumMailShell',
		classList: ['mail-civilization-shell', 'geelooy-content-region'],
		attributes: {
			'aria-label': 'Mail communication workspace',
			'data-scroll-owner': 'workspace'
		},
		children: [workspaceHeader(), workspaceFrame(ui)]
	});
	connectMalchusNavigation(ui);
	return connectWorkspacePanels(ui);
}

function workspaceFrame(ui) {
	return {
		tag: 'div',
		shaym: 'appContainer',
		classList: ['app-container', 'mail-civilization-frame', 'mail-workspace-frame'],
		children: [sidebarVessel(ui), chatVessel(ui)]
	};
}

function sidebarVessel(ui) {
	return {
		tag: 'aside',
		classList: ['sidebar', 'mail-civilization-sidebar', 'mail-sidebar'],
		shaym: 'sidebarPanel',
		attributes: {
			id: 'mail-conversation-list',
			'aria-label': 'Conversation list',
			'data-scroll-region': 'conversations'
		},
		ready: element => renderSidebar(ui, element)
	};
}

function chatVessel(ui) {
	return {
		tag: 'main',
		classList: ['chat-area', 'mail-civilization-chat', 'mail-chat'],
		shaym: 'chatPanel',
		attributes: {
			'aria-label': 'Selected conversation',
			'data-scroll-region': 'conversation'
		},
		ready: element => renderChat(ui, element)
	};
}
