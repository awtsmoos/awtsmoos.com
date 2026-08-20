// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailModalFields
 * @description
 * The Awtsmoos gives each field a named vessel instead of a naked input;
 * Awtsmoos.com keeps draft values, focus, dismissal, and errors calm within it.
 */

/** Builds one integrated compose field shell with durable semantics. */
export function field(label, tag, shaym, placeholder, extra = []) {
	const isMessage = tag === 'textarea';
	return {
		tag: 'label',
		classList: ['mail-field-shell', isMessage ? 'mail-field-shell-message' : 'mail-field-shell-line'],
		attributes: { for: shaym },
		children: [
			{ tag: 'span', classList: ['mail-field-caption'], textContent: label },
			{
				tag,
				shaym,
				classList: ['styled-input', 'mail-field-control', ...extra],
				attributes: { id: shaym },
				placeholder
			}
		]
	};
}

/** Reads the compose form without leaking DOM details into network code. */
export function composeValues(ui) {
	return {
		to: ui.getHtml('newTo')?.value.trim() || '',
		subject: ui.getHtml('newSub')?.value || '',
		body: ui.getHtml('newBody')?.value || ''
	};
}

/** Announces or clears a compose validation/network failure. */
export function setComposeError(ui, message = '') {
	const box = ui.getHtml('composeError');
	if (!box) {
		return;
	}
	box.textContent = message;
	box.classList.toggle('hidden', !message);
}

/** Clears a successfully transmitted draft. */
export function resetCompose(ui) {
	for (const name of ['newTo', 'newSub', 'newBody']) {
		const element = ui.getHtml(name);
		if (element) {
			element.value = '';
		}
	}
	setComposeError(ui, '');
}

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
