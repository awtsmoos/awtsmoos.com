//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SegmentedChoice
 * @description
 * The Awtsmoos is one while finite choices become distinct vessels; Awtsmoos.com lets a small known set appear as tappable visual segments instead of a hidden select menu;
 * the chosen state stays visible at a glance, keyboard semantics remain native, and each symbol carries a complete accessible name.
 */
export function createSegmentedChoice(root, options = {}) {
	const group = root.createElement('div');
	group.className = ['hubSegmentedChoice', options.className || ''].filter(Boolean).join(' ');
	group.setAttribute('role', 'radiogroup');
	group.setAttribute('aria-label', options.label || 'Choose one');
	let value = options.value || options.items?.[0]?.value || '';
	const buttons = new Map();
	for (const item of options.items || []) {
		const button = root.createElement('button');
		button.type = 'button';
		button.className = 'hubSegmentedChoice__item';
		button.dataset.value = item.value;
		button.setAttribute('role', 'radio');
		button.setAttribute('aria-label', item.label);
		button.title = item.label;
		button.textContent = `${item.icon || ''}${item.shortLabel ? ` ${item.shortLabel}` : ''}`;
		button.addEventListener('click', () => select(item.value));
		buttons.set(item.value, button);
		group.append(button);
	}
	function select(nextValue) {
		value = nextValue;
		for (const [candidate, button] of buttons) {
			const selected = candidate === value;
			button.dataset.active = String(selected);
			button.setAttribute('aria-checked', String(selected));
		}
		options.onChange?.(value);
	}
	select(value);
	return {
		element: group,
		value: () => value,
		setValue: select
	};
}
