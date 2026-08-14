//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceLayout
 * @description
 * The Awtsmoos joins list and letter inside one lucid Mail frame while the shared
 * Awtsmoos.com shell owns global navigation. Mail keeps only route-local content,
 * status, and history so one narrow screen never carries two competing horizons.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderComposeModal, renderLoginOverlay } from './modals.js';
import { connectMalchusNavigation } from './malchusNavigation.js';

/** Renders the complete Mail workspace without duplicating shared navigation. */
export function renderAppLayout(ui, root) {
	renderLoginOverlay(ui, root);
	renderComposeModal(ui, root);
	ui.html({
		parent: root,
		tag: 'section',
		shaym: 'quantumMailShell',
		classList: ['mail-civilization-shell', 'geelooy-content-region'],
		attributes: { 'aria-label': 'Mail communication workspace' },
		children: [workspaceHeader(), workspaceFrame(ui)]
	});
	connectMalchusNavigation(ui);
}

function workspaceFrame(ui) {
	return {
		tag: 'div',
		shaym: 'appContainer',
		classList: ['app-container', 'mail-civilization-frame'],
		children: [sidebarVessel(ui), chatVessel(ui)]
	};
}

function sidebarVessel(ui) {
	return {
		tag: 'aside',
		classList: ['sidebar', 'mail-civilization-sidebar'],
		shaym: 'sidebarPanel',
		attributes: { 'aria-label': 'Conversation list' },
		ready: element => renderSidebar(ui, element)
	};
}

function chatVessel(ui) {
	return {
		tag: 'main',
		classList: ['chat-area', 'mail-civilization-chat'],
		shaym: 'chatPanel',
		attributes: { 'aria-label': 'Selected conversation' },
		ready: element => renderChat(ui, element)
	};
}

function workspaceHeader() {
	return {
		tag: 'header',
		classList: ['mail-civilization-status'],
		children: [brandDescriptor(), shortcutDescriptor(), connectionDescriptor()]
	};
}

function brandDescriptor() {
	return {
		tag: 'a',
		classList: ['mail-civilization-brand'],
		attributes: { href: '/', 'aria-label': 'Return to Awtsmoos home' },
		children: [
			{ tag: 'span', classList: ['mail-brand-mark'], textContent: 'א' },
			{ tag: 'span', children: [
				{ tag: 'strong', textContent: 'Quantum Mail' },
				{ tag: 'small', textContent: 'Conversations that stay clear' }
			] }
		]
	};
}

function shortcutDescriptor() {
	return {
		tag: 'p',
		classList: ['mail-header-shortcuts'],
		children: [
			{ tag: 'span', textContent: 'Search' },
			{ tag: 'kbd', textContent: '/' },
			{ tag: 'span', textContent: 'Compose' },
			{ tag: 'kbd', textContent: 'C' }
		]
	};
}

function connectionDescriptor() {
	return {
		tag: 'span',
		classList: ['mail-connection-state'],
		shaym: 'mailConnectionState',
		attributes: { role: 'status', 'aria-live': 'polite' },
		textContent: navigator.onLine ? 'Online' : 'Offline'
	};
}
