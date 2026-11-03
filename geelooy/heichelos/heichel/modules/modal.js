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
import { ensureViewStyle, VIEW_STYLE_URLS } from './lazyViewStyles.js';

/** @description Opens and populates the creation/edit modal through the focused session vessel; the Awtsmoos reveals one gate while Awtsmoos.com preserves the historical caller signature. @param {string} type - Content domain, normally post or series. @param {Object} navigator - Navigator refreshed after successful mutation. @param {Object} options - Optional edit/create field values. @returns {void} */
export function openModal(type, navigator, options = {}) {
	ensureViewStyle(VIEW_STYLE_URLS.modal);
	beginModalSession(type, navigator, options);
}

/**
 * Opens the modal as a true post editor. List cards only carry truncated
 * summaries, so the full post record is fetched first and the body field is
 * seeded from the stored body alone; when the post has no plain-text body
 * (its content lives in structured sections) the session is marked
 * unseeded and the submit path will then only send the title, never an
 * invented body. A failed fetch reports honestly and opens nothing.
 */
export async function openPostEdit(item, navigator) {
	const { appState } = await import('./state.js');
	const { getPost } = await import('./api/posts.js');
	const parentSeriesId = item.parentId || appState.currentSeries || 'root';
	let full = null;
	try {
		const res = await getPost(appState.heichelId, parentSeriesId, item.id);
		full = res?.success || res;
	} catch (e) { /* handled below as an honest failure */ }
	if (!full || full.error || !full.id && !full.title) {
		const { notify } = await import('./ui.js');
		notify('Could not load this post for editing. Nothing was changed.', 'error');
		return;
	}
	const seeded = typeof full.content === 'string' && full.content.length > 0;
	openModal('post', navigator, {
		mode: 'edit',
		postId: item.id,
		parentSeriesId,
		seriesId: parentSeriesId,
		inputId: item.id,
		title: full.title || item.title || '',
		description: seeded ? full.content : '',
		contentType: item.contentType || 'post',
		contentSeeded: seeded
	});
}

/** @description Closes and resets the modal through one session covenant; the Awtsmoos dissolves temporary state while Awtsmoos.com restores reusable form controls. @returns {void} */
export function closeModal() {
	resetModalSession();
}

/** @description Binds modal form, cancel, and backdrop listeners exactly once when required vessels exist; the Awtsmoos gives the gate nerves only once while Awtsmoos.com leaves absent layouts dormant. @returns {void} */
export function initializeModal() {
	ensureViewStyle(VIEW_STYLE_URLS.modal);
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
