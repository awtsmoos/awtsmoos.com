// B"H
/**
 * @module QuantumMailChatHeader
 * @description Builds the thread header, back control, spotlight control, and
 * explicit purge doorway without hiding their behavior in a large layout file.
 */
import { toggleSpotlight } from '../physics.js';
import { showDeleteConfirmation } from './deleteDialog.js';

/** Returns the complete active-thread header descriptor. */
export function chatHeader(ui, parent) {
	return {
		tag: 'header',
		classList: ['chat-header'],
		children: [
			{
				tag: 'div',
				classList: ['chat-heading-lockup'],
				children: [
					{ tag: 'button', classList: ['back-button'], attributes: { type: 'button', 'aria-label': 'Return to sender groups' }, textContent: '←', events: { click: () => closeThread(ui) } },
					{ tag: 'span', classList: ['chat-frequency-light'], textContent: 'LIVE' },
					{ tag: 'div', children: [
						{ tag: 'p', classList: ['chat-kicker'], textContent: 'ACTIVE FREQUENCY' },
						{ tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Quantum Stream' }
					] }
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
			{ tag: 'button', classList: ['tool-btn'], attributes: { type: 'button', 'aria-label': 'Open thread actions', 'aria-expanded': 'false' }, textContent: '⋮', events: { click: event => toggleMenu(event.currentTarget) } },
			{
				tag: 'div',
				classList: ['context-menu', 'hidden'],
				attributes: { role: 'menu', 'aria-hidden': 'true' },
				children: [
					{ tag: 'button', classList: ['ctx-item'], attributes: { type: 'button', role: 'menuitem' }, textContent: 'Toggle spotlight', events: { click: event => runAction(event, toggleSpotlight) } },
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
}

function bindOutsideClose(menu) {
	document.addEventListener('pointerdown', event => {
		if (menu.classList.contains('hidden') || menu.contains(event.target) || menu.previousElementSibling?.contains(event.target)) return;
		menu.classList.add('hidden');
		menu.setAttribute('aria-hidden', 'true');
		menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
	});
}

function runAction(event, callback) {
	const menu = event.currentTarget.closest('.context-menu');
	menu?.classList.add('hidden');
	menu?.setAttribute('aria-hidden', 'true');
	callback();
}

function closeThread(ui) {
	ui.getHtml('appContainer')?.classList.remove('view-chat');
	document.dispatchEvent(new CustomEvent('chat:exit'));
	const url = new URL(location.href);
	url.searchParams.delete('thread');
	history.pushState({}, '', url);
}
