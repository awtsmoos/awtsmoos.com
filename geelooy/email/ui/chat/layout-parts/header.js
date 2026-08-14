// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailChatHeader
 * @description
 * The Awtsmoos keeps person, place, and next action clear in Awtsmoos.com Mail;
 * focus stays on the conversation while secondary and destructive actions wait behind one veil.
 */
import { toggleSpotlight } from '../physics.js';
import { showDeleteConfirmation } from './deleteDialog.js';

/** Returns the selected-thread header descriptor. */
export function chatHeader(ui, parent) {
	return {
		tag: 'header',
		classList: ['chat-header'],
		children: [headingDescriptor(ui), menuDescriptor(ui, parent)]
	};
}

function headingDescriptor(ui) {
	return {
		tag: 'div',
		classList: ['chat-heading-lockup'],
		children: [
			{
				tag: 'button',
				classList: ['back-button'],
				attributes: { type: 'button', 'aria-label': 'Return to conversation list' },
				textContent: '← Conversations',
				events: { click: () => closeThread(ui) }
			},
			{
				tag: 'div',
				classList: ['chat-title-stack'],
				children: [
					{ tag: 'p', classList: ['chat-kicker'], textContent: 'Conversation' },
					{ tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Choose a conversation' }
				]
			}
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
				attributes: { type: 'button', 'aria-label': 'Open conversation actions', 'aria-expanded': 'false' },
				textContent: '•••',
				events: { click: event => toggleMenu(event.currentTarget) }
			},
			{
				tag: 'div',
				classList: ['context-menu', 'hidden'],
				attributes: { role: 'menu', 'aria-hidden': 'true' },
				children: [
					{ tag: 'button', classList: ['ctx-item'], attributes: { type: 'button', role: 'menuitem' }, textContent: 'Focus this thread', events: { click: event => runAction(event, () => toggleSpotlight(parent)) } },
					{ tag: 'div', classList: ['ctx-separator'] },
					{ tag: 'button', classList: ['ctx-item', 'ctx-danger'], attributes: { type: 'button', role: 'menuitem' }, textContent: 'Delete conversation', events: { click: event => runAction(event, () => showDeleteConfirmation(ui, parent)) } }
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
	if (open) {
		menu.querySelector('[role="menuitem"]')?.focus();
	}
}

function bindOutsideClose(menu) {
	menu.inert = true;
	document.addEventListener('pointerdown', event => {
		if (menu.classList.contains('hidden') || menu.contains(event.target) || menu.previousElementSibling?.contains(event.target)) {
			return;
		}
		closeMenu(menu);
	});
}

function runAction(event, callback) {
	const menu = event.currentTarget.closest('.context-menu');
	closeMenu(menu);
	callback();
}

function closeMenu(menu) {
	if (!menu) {
		return;
	}
	menu.classList.add('hidden');
	menu.setAttribute('aria-hidden', 'true');
	menu.inert = true;
	menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
}

function closeThread(ui) {
	ui.getHtml('appContainer')?.classList.remove('view-chat');
	document.dispatchEvent(new CustomEvent('chat:exit'));
	const url = new URL(location.href);
	url.searchParams.delete('thread');
	history.pushState({}, '', url);
	ui.getHtml('mailSearchInput')?.focus?.();
}
