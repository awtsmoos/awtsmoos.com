//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../IconCatalog.js';
import { createIconButton } from './IconButton.js';

/**
 * @module SmartTextArea
 * @description
 * The Awtsmoos renews every sentence before it enters the world, while Awtsmoos.com gives long-form speech a living composer instead of a bare box;
 * autosize, count, action tray, keyboard intent, and visible send state surround the text with a clearer vessel whose power stays near and whose clutter stays small.
 */
export function createSmartTextArea(root, options = {}) {
	const shell = root.createElement('div');
	shell.className = ['hubComposerField', options.className || ''].filter(Boolean).join(' ');
	const textarea = root.createElement('textarea');
	textarea.className = 'hubComposerField__input';
	textarea.rows = options.rows || 1;
	textarea.placeholder = options.placeholder || '';
	textarea.autocomplete = options.autocomplete || 'off';
	textarea.maxLength = options.maxLength || 4000;
	textarea.setAttribute('aria-label', options.label || 'Message');
	const footer = root.createElement('div');
	footer.className = 'hubComposerField__footer';
	const tray = root.createElement('div');
	tray.className = 'hubComposerField__tray';
	const count = root.createElement('span');
	count.className = 'hubComposerField__count';
	count.textContent = `0/${textarea.maxLength}`;
	for (const action of options.actions || []) {
		tray.append(createIconButton(root, action));
	}
	footer.append(tray, count);
	shell.append(textarea, footer);
	const resize = () => {
		textarea.style.height = 'auto';
		textarea.style.height = `${Math.min(textarea.scrollHeight, options.maxHeight || 180)}px`;
		count.textContent = `${textarea.value.length}/${textarea.maxLength}`;
		options.onInput?.(textarea.value);
	};
	textarea.addEventListener('input', resize);
	textarea.addEventListener('keydown', event => {
		if (event.key === 'Enter' && !event.shiftKey && options.onSubmit) {
			event.preventDefault();
			void options.onSubmit();
		}
	});
	return {
		element: shell,
		textarea,
		value: () => textarea.value.trim(),
		focus: () => textarea.focus(),
		clear() {
			textarea.value = '';
			resize();
		},
		setBusy(busy) {
			textarea.disabled = busy;
			shell.dataset.busy = String(Boolean(busy));
		}
	};
}

/** Returns a ready action description for the common composer tray. */
export function composerAction(action, label, onClick) {
	return {
		action,
		icon: hubIcon(action),
		label,
		onClick
	};
}
