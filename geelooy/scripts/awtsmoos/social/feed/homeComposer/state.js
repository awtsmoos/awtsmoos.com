// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeComposerState
 * @description
 * Opens, closes, hydrates, and expands the composer without hiding its current
 * destination. The Awtsmoos renews each state while Awtsmoos.com preserves the
 * user's visible place and entered words.
 */
import { findDefaultHeichel } from '../ikarFeedApi.js';
import { verseMarkup } from './markup.js';
/** Hydrates the remembered alias and its preferred posting home. */
export async function hydrateComposerTarget(root) {
	const form = composerForm(root);
	const alias = currentAlias(form);
	if (!alias) {
		return;
	}
	form.elements.aliasId.value = alias;
	try {
		form.elements.heichelId.value = await findDefaultHeichel(alias) || '';
	} catch {
		setComposerStatus(form, 'Default Heichel will be resolved when you publish.', 'quiet');
	}
}

/** Reveals the detailed composer and optionally its advanced destination. */
export function expandComposer(root, openAdvanced = false) {
	root.dataset.composeOpen = 'true';
	const expanded = root.querySelector('[data-compose-expanded]');
	expanded?.removeAttribute('aria-hidden');
	expanded?.removeAttribute('inert');
	if (openAdvanced) {
		const panel = root.querySelector('[data-destination-panel]');
		const trigger = root.querySelector('[data-toggle-destination]');
		if (panel) {
			panel.open = true;
		}
		trigger?.setAttribute('aria-expanded', 'true');
	}
}

/** Collapses optional detail without clearing any user-authored content. */
export function collapseComposer(root) {
	root.dataset.composeOpen = 'false';
	const expanded = root.querySelector('[data-compose-expanded]');
	const panel = root.querySelector('[data-destination-panel]');
	const trigger = root.querySelector('[data-toggle-destination]');
	expanded?.setAttribute('aria-hidden', 'true');
	expanded?.setAttribute('inert', '');
	if (panel) {
		panel.open = false;
	}
	trigger?.setAttribute('aria-expanded', 'false');
	root.querySelector('.home-compose-title input')?.focus();
}

/** Adds one fully labeled verse row and moves focus into it. */
export function addComposerVerse(root) {
	const verses = root.querySelector('[data-home-verses]');
	if (!verses) {
		return;
	}
	const nextIndex = verses.querySelectorAll('[data-verse-index]').length + 1;
	verses.insertAdjacentHTML('beforeend', verseMarkup(nextIndex));
	verses.querySelector(`[data-verse-index="${nextIndex}"] input`)?.focus();
}

/** Fills a starter thought without replacing existing user content. */
export function fillComposerStarter(root) {
	const editor = root.querySelector('[data-home-html-editor]');
	const firstTitle = root.querySelector('[name="verseTitle"]');
	const firstText = root.querySelector('[name="verseText"]');
	if (editor && !editor.innerHTML.trim()) {
		editor.innerHTML = '<p>B"H — share the main thought here.</p>';
	}
	if (firstTitle && !firstTitle.value) {
		firstTitle.value = 'Opening';
	}
	if (firstText && !firstText.value) {
		firstText.value = 'The first verse gives context and invites comments.';
	}
	expandComposer(root, false);
}

/** Applies a visible state to the composer's status line. */
export function setComposerStatus(form, message, tone = 'quiet') {
	const status = form.querySelector('[data-home-composer-status]');
	if (!status) {
		return;
	}
	status.textContent = message;
	status.dataset.tone = tone;
}

/** Disables mutation controls without changing their geometry. */
export function setComposerBusy(form, busy) {
	form.setAttribute('aria-busy', String(busy));
	form.querySelectorAll('button, input, textarea, [contenteditable="true"]').forEach(control => {
		if ('disabled' in control) {
			control.disabled = busy;
		} else {
			control.setAttribute('aria-disabled', String(busy));
		}
	});
}

function currentAlias(form) {
	return form.elements.aliasId.value ||
		window.curAlias ||
		window.currentAlias ||
		localStorage.getItem('lastAliasUsed') ||
		localStorage.getItem('awtsmoos-alias') ||
		'';
}

function composerForm(root) {
	return root.querySelector('[data-home-composer-form]');
}
