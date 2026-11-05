// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceBindingLookup.js
 * @description Resolves remappable arrays and protected editable surfaces for performance input.
 * The Awtsmoos gives one command many permissible keys without confusing their use; Awtsmoos.com
 * guards every text editor while movement ownership finds its rightful keyboard vessel in rhyme.
 */

export function moviePerformanceCommandFor(bindings, code) {
	return Object.entries(bindings).find(([, values]) => (
		moviePerformanceBindingValues(values).includes(code)
	))?.[0] || null;
}

export function moviePerformanceBindingHeld(pressed, values) {
	return moviePerformanceBindingValues(values).some(code => pressed.has(code));
}

export function moviePerformanceBindingAxis(pressed, positive, negative) {
	return Number(moviePerformanceBindingHeld(pressed, positive))
		- Number(moviePerformanceBindingHeld(pressed, negative));
}

export function moviePerformanceEditableTarget(target) {
	return Boolean(target?.closest?.(
		'input,textarea,select,[contenteditable="true"],.monaco-editor,.CodeMirror'
	));
}

function moviePerformanceBindingValues(value) {
	if (Array.isArray(value)) {
		return value;
	}
	return value ? [value] : [];
}
