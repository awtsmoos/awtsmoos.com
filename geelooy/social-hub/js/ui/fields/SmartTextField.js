//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../IconCatalog.js';
import { createIconButton } from './IconButton.js';
import { createFieldShell } from './FieldShell.js';

/**
 * @module SmartTextField
 * @description
 * The Awtsmoos renews the word before it is searched, while Awtsmoos.com gives that word a clearable, counted, icon-led vessel instead of a naked rectangle;
 * helper state and trailing actions remain close to the value, so power grows while visible prose becomes light.
 */
export function createSmartTextField(root, options = {}) {
	const shell = createFieldShell(root, {
		className: options.className,
		helper: options.helper,
		icon: options.icon || hubIcon(options.kind === 'search' ? 'search' : 'profile'),
		label: options.label
	});
	const input = root.createElement('input');
	input.type = options.type || (options.kind === 'search' ? 'search' : 'text');
	input.placeholder = options.placeholder || '';
	input.autocomplete = options.autocomplete || 'off';
	input.maxLength = options.maxLength || 160;
	if (options.id) input.id = options.id;
	if (options.label) input.setAttribute('aria-label', options.label);
	const clear = createIconButton(root, {
		action: 'clear',
		label: 'Clear field',
		onClick: event => {
			event.preventDefault();
			input.value = '';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			input.focus();
			options.onClear?.();
		}
	});
	clear.classList.add('hubSmartField__clear');
	shell.controlHost.append(input);
	shell.trailing.append(clear);
	input.addEventListener('input', () => {
		shell.element.dataset.empty = String(!input.value);
		options.onInput?.(input.value);
	});
	shell.element.dataset.empty = 'true';
	return {
		element: shell.element,
		input,
		focus: () => input.focus(),
		value: () => input.value.trim(),
		setValue(value = '') {
			input.value = String(value);
			shell.element.dataset.empty = String(!input.value);
		}
	};
}
