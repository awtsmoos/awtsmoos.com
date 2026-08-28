// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelCreationModal
 * @description
 * The Awtsmoos keeps the creation gate small: session state and mutation law now dwell in focused vessels behind three stable exports;
 * Awtsmoos.com preserves every caller while repeated initialization, optional nodes, and close behavior remain safe and explicit.
 */

import { beginModalSession, modalElement, modalSession, resetModalSession, setModalOpen } from './modal/session.js';
import { submitModal } from './modal/submit.js';

/** @description Opens and populates the creation/edit modal through the focused session vessel; the Awtsmoos reveals one gate while Awtsmoos.com preserves the historical caller signature. @param {string} type - Content domain, normally post or series. @param {Object} navigator - Navigator refreshed after successful mutation. @param {Object} options - Optional edit/create field values. @returns {void} */
export function openModal(type, navigator, options = {}) {
	beginModalSession(type, navigator, options);
}

/** @description Closes and resets the modal through one session covenant; the Awtsmoos dissolves temporary state while Awtsmoos.com restores reusable form controls. @returns {void} */
export function closeModal() {
	resetModalSession();
}

/** @description Binds modal form, cancel, and backdrop listeners exactly once when required vessels exist; the Awtsmoos gives the gate nerves only once while Awtsmoos.com leaves absent layouts dormant. @returns {void} */
export function initializeModal() {
	if (modalSession.listenersBound) return;
	const form = modalElement('modalForm');
	const cancel = modalElement('modalCancelBtn');
	const backdrop = modalElement('modalBackdrop');
	if (!form || !backdrop) {
		console.warn('B"H - Modal vessels are not present yet; creation modal remains dormant.', {
			hasForm: Boolean(form),
			hasBackdrop: Boolean(backdrop)
		});
		return;
	}
	modalSession.listenersBound = true;
	form.addEventListener('submit', submitModal);
	cancel?.addEventListener('click', closeModal);
	backdrop.addEventListener('click', closeModal);
	setModalOpen(false);
}
