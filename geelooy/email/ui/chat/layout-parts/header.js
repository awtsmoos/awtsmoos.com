// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailChatHeader
 * @description The Awtsmoos keeps the selected person and thread clear; Awtsmoos.com exposes back, focus, and destructive actions without fake presence.
 */
import { toggleSpotlight } from '../physics.js';
import { showDeleteConfirmation } from './deleteDialog.js';

/** Returns the active-thread header descriptor. */
export function chatHeader(ui, parent) {
	return {
		tag: 'header',
		classList: ['chat-header'],
		children: [
			{
				tag: 'div',
				classList: ['chat-heading-lockup'],
				children: [
					{
						tag: 'button',
						classList: ['back-button'],
						attributes: { type: 'button', 'aria-label': 'Return to conversation list' },
						textContent: 'Back',
						events: { click: () => closeThread(ui) }
					},
					{
						tag: 'div',
						children: [
							{ tag: 'p', classList: ['chat-kicker'], textContent: 'Selected conversation' },
							{ tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Choose a conversation' }
						]
					}
				]
			},
			menuDescriptor(ui, parent)
		]
	};
}

function menuDescriptor(ui, parent) {
	return {
		tag: 'div',
		classList: ['chat-tools'],
		children: [
			{
				tag: 'button',
				classList: ['tool-btn'],
				attributes: { type: 'button', 'aria-label': 'Open thread actions', 'aria-expanded': 'false' },
				textContent: 'More',
				events: { click: event => toggleMenu(event.currentTarget) }
			},
			{
				tag: 'div',
				classList: ['context-menu', 'hidden'],
				attributes: { role: 'menu', 'aria-hidden': 'true' },
				children: [
					{ tag: 'button', classList: ['ctx-item'], attributes: { type: 'button', role: 'menuitem' }, textContent: 'Focus this thread', events: { click: event => runAction(event, () => toggleSpotlight(parent)) } },
					{ tag: 'div', classList: ['ctx-separator'] },
					{ tag: 'button', classList: ['ctx-item', 'ctx-danger'], attributes: { type: 'button', role: 'menuitem' }, textContent: 'Delete thread', events: { click: event => runAction(event, () => showDeleteConfirmation(ui, parent)) } }
				],
				ready: menu => bindOutsideClose(menu)
			}
		]
	};
}

function toggleMenu(button) {
	const menu = button.nextElementSibling;
	const open = menu.classList.contains('hidden');
	menu.classList.toggle('hidden', !open);
	menu.setAttribute('aria-hidden', String(!open));
	button.setAttribute('aria-expanded', String(open));
	menu.inert = !open;
	if (open) menu.querySelector('[role="menuitem"]')?.focus();
}

function bindOutsideClose(menu) {
	menu.inert = true;
	document.addEventListener('pointerdown', event => {
		if (menu.classList.contains('hidden') || menu.contains(event.target) || menu.previousElementSibling?.contains(event.target)) return;
		menu.classList.add('hidden');
		menu.setAttribute('aria-hidden', 'true');
		menu.inert = true;
		menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
	});
}

function runAction(event, callback) {
	const menu = event.currentTarget.closest('.context-menu');
	menu?.classList.add('hidden');
	menu?.setAttribute('aria-hidden', 'true');
	if (menu) menu.inert = true;
	callback();
}

function closeThread(ui) {
	ui.getHtml('appContainer')?.classList.remove('view-chat');
	document.dispatchEvent(new CustomEvent('chat:exit'));
	const url = new URL(location.href);
	url.searchParams.delete('thread');
	history.pushState({}, '', url);
}
