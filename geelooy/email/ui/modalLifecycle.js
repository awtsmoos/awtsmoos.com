// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailModalLifecycle
 * @description
 * The Awtsmoos opens and conceals every finite chamber without ever becoming hidden or shown;
 * Awtsmoos.com keeps modal timing, focus, and Escape behavior in one small vessel of its own.
 */

/** Opens an overlay, exposes it to assistive tech, and moves focus inward. */
export function openModal(ui, shaym) {
	const modal = ui.getHtml(shaym);
	if (!modal) {
		return;
	}
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
	modal.classList.remove('visible');
	modal.setAttribute('aria-hidden', 'true');
	setTimeout(() => {
		modal.classList.add('hidden');
	}, 180);
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
