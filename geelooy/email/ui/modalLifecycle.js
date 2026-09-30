// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailModalLifecycle
 * @description
 * The Awtsmoos opens and conceals every finite chamber without ever becoming hidden or shown;
 * Awtsmoos.com keeps modal timing, focus, and Escape behavior in one small vessel of its own.
 */

import { trapTabIn } from '../ux.js';

/** One trap listener per modal shell so repeated opens never stack handlers. */
const trapHandlers = new WeakMap();
/** Element that owned focus before each modal opened, restored on close. */
const returnFocusTo = new WeakMap();

/** Opens an overlay, exposes it to assistive tech, and moves focus inward. */
export function openModal(ui, shaym) {
	const modal = ui.getHtml(shaym);
	if (!modal) {
		return;
	}
	returnFocusTo.set(modal, document.activeElement);
	ensureFocusTrap(modal);
	modal.classList.remove('hidden');
	modal.setAttribute('aria-hidden', 'false');
	requestAnimationFrame(() => {
		modal.classList.add('visible');
		modal.focus?.({ preventScroll: true });
	});
}

/** Closes an overlay after its short exit animation. */
export function closeModal(ui, shaym) {
	const modal = ui.getHtml(shaym);
	if (!modal) {
		return;
	}
	releaseFocusTrap(modal);
	modal.classList.remove('visible');
	modal.setAttribute('aria-hidden', 'true');
	restoreModalFocus(modal);
	setTimeout(() => {
		modal.classList.add('hidden');
	}, 180);
}

/** Binds one Tab-trap keydown listener to a modal shell. */
function ensureFocusTrap(modal) {
	if (trapHandlers.has(modal)) {
		return;
	}
	const handler = event => trapTabIn(modal, event);
	trapHandlers.set(modal, handler);
	modal.addEventListener('keydown', handler);
}

/** Removes the Tab-trap listener installed by ensureFocusTrap. */
function releaseFocusTrap(modal) {
	const handler = trapHandlers.get(modal);
	if (!handler) {
		return;
	}
	modal.removeEventListener('keydown', handler);
	trapHandlers.delete(modal);
}

/** Returns focus to the element that opened the modal when focus is still inside it. */
function restoreModalFocus(modal) {
	const target = returnFocusTo.get(modal);
	returnFocusTo.delete(modal);
	if (!target || typeof target.focus !== 'function' || !document.contains(target)) {
		return;
	}
	const active = document.activeElement;
	if (active && active !== document.body && modal.contains(active)) {
		target.focus({ preventScroll: true });
	}
}

/** Gives each modal one keyboard Escape path. */
export function bindModalEscape(ui, shaym) {
	const modal = ui.getHtml(shaym);
	if (!modal || modal.dataset.escapeBound === 'true') {
		return;
	}
	modal.dataset.escapeBound = 'true';
	modal.addEventListener('keydown', event => {
		if (event.key === 'Escape') {
			closeModal(ui, shaym);
		}
	});
}
