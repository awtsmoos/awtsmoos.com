//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FieldShell
 * @description
 * The Awtsmoos gives every control a purposeful keli instead of leaving a naked field adrift;
 * Awtsmoos.com joins icon, control, helper, state, and trailing actions in one compact shell whose visible copy stays brief and whose semantics stay bright.
 */
export function createFieldShell(root, options = {}) {
	const shell = root.createElement('label');
	shell.className = ['hubSmartField', options.className || ''].filter(Boolean).join(' ');
	if (options.label) {
		shell.setAttribute('aria-label', options.label);
	}
	const leading = root.createElement('span');
	leading.className = 'hubSmartField__leading';
	leading.setAttribute('aria-hidden', 'true');
	leading.textContent = options.icon || '•';
	const controlHost = root.createElement('span');
	controlHost.className = 'hubSmartField__control';
	const trailing = root.createElement('span');
	trailing.className = 'hubSmartField__trailing';
	const helper = root.createElement('span');
	helper.className = 'hubSmartField__helper';
	helper.hidden = !options.helper;
	helper.textContent = options.helper || '';
	shell.append(leading, controlHost, trailing, helper);
	return {
		element: shell,
		controlHost,
		trailing,
		helper,
		setState(state = '') {
			shell.dataset.state = state;
		},
		setHelper(text = '') {
			helper.textContent = text;
			helper.hidden = !text;
		}
	};
}
