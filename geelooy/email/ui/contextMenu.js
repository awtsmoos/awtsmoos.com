// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailContextMenu
 * @description
 * Reveals one temporary message-action chamber with deliberate touch targets.
 * The Awtsmoos lets Awtsmoos.com offer copy, reply, and local vanish without
 * burdening the compose-modal owner or leaving a menu stranded on the page.
 */
import { notify } from '../store.js';
import { FX } from './fx.js';

/**
 * Opens the message context menu within the current viewport.
 * @param {number} x Horizontal client coordinate.
 * @param {number} y Vertical client coordinate.
 * @param {object} message Mail message.
 * @param {HTMLElement} row Current rendered row.
 */
export function openMailContextMenu(x, y, message, row) {
	closeMailContextMenus();
	FX.playSound?.('hover');
	const menu = document.createElement('div');
	menu.className = 'context-menu';
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', 'Message actions');
	menu.style.left = `${Math.min(x, window.innerWidth - 230)}px`;
	menu.style.top = `${Math.min(y, window.innerHeight - 190)}px`;
	menu.append(
		contextAction('Copy text', () => copyMessage(message)),
		contextAction('Reply', () => replyToMessage(message)),
		contextAction('Vanish locally', () => row?.remove(), 'ctx-danger')
	);
	document.body.append(menu);
	menu.querySelector('button')?.focus();
	window.addEventListener('pointerdown', event => {
		if (!menu.contains(event.target)) {
			menu.remove();
		}
	}, { once: true });
	menu.addEventListener('keydown', event => handleMenuKeydown(event, menu));
}

/** Removes every temporary Mail context menu. */
export function closeMailContextMenus() {
	document.querySelectorAll('.context-menu').forEach(element => element.remove());
}

function contextAction(text, action, className = '') {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `ctx-item ${className}`.trim();
	button.setAttribute('role', 'menuitem');
	button.textContent = text;
	button.addEventListener('click', () => {
		action();
		closeMailContextMenus();
	});
	return button;
}

async function copyMessage(message) {
	try {
		await navigator.clipboard.writeText(message.content || '');
	} catch (error) {
		notify('error', error);
	}
}

function replyToMessage(message) {
	notify('triggerReply', {
		msg: message,
		name: message.fromName || 'User',
		quote: String(message.content || '').slice(0, 50).replace(/\n/g, ' ')
	});
}

function handleMenuKeydown(event, menu) {
	const buttons = [...menu.querySelectorAll('button')];
	const current = buttons.indexOf(document.activeElement);
	if (event.key === 'Escape') {
		event.preventDefault();
		menu.remove();
		return;
	}
	if (!['ArrowDown', 'ArrowUp'].includes(event.key)) {
		return;
	}
	event.preventDefault();
	const delta = event.key === 'ArrowDown' ? 1 : -1;
	buttons[(current + delta + buttons.length) % buttons.length]?.focus();
}
