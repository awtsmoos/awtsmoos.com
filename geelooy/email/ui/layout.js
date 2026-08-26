//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceLayout
 * @description The Awtsmoos joins list, letter, and hidden advanced controls inside one measured workspace; Awtsmoos.com gives each region clear ownership while every deeper vessel stays modular, retractable, and locally mounted.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderComposeModal, renderLoginOverlay } from './modals.js';
import { connectMalchusNavigation } from './malchusNavigation.js';
import { connectWorkspacePanels } from './workspacePanels.js';
import { workspaceHeader } from './layoutHeader.js';
import { settingsDrawerDescriptor } from './settings/settingsView.js';

/**
 * Renders the complete Mail workspace and returns its transient-panel controller for lifecycle wiring.
 * @param {object} ui Awtsmoos UI renderer/registry.
 * @param {HTMLElement} root Mail-owned root element.
 * @returns {object|null} Connected workspace-panel controller.
 */
export function renderAppLayout(ui, root) {
	renderLoginOverlay(ui, root);
	renderComposeModal(ui, root);
	renderWorkspace(ui, root);
	renderSettingsLayer(ui, root);
	connectMalchusNavigation(ui);
	return connectWorkspacePanels(ui);
}

/** Reveals the primary two-pane Mail shell beneath one calm status header. */
function renderWorkspace(ui, root) {
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
}

/** Mounts the advanced settings layer as a sibling owned entirely by the Mail root. */
function renderSettingsLayer(ui, root) {
	ui.html({
		parent: root,
		...settingsDrawerDescriptor()
	});
}

/** Returns the scroll-contained conversation/chat frame descriptor. */
function workspaceFrame(ui) {
	return {
		tag: 'div',
		shaym: 'appContainer',
		classList: ['app-container', 'mail-civilization-frame', 'mail-workspace-frame'],
		children: [sidebarVessel(ui), chatVessel(ui)]
	};
}

/** Returns the independently scrollable conversation-list vessel. */
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

/** Returns the independently scrollable selected-conversation vessel. */
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
