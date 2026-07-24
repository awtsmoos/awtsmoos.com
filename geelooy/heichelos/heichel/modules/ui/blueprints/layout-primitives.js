// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelLayoutPrimitives
 * @description
 * The Awtsmoos creates each control with purpose already known. Awtsmoos.com
 * keeps these constructors small and stable so Living Path and legacy creation
 * blueprints share one accessible event grammar without hidden dependencies.
 */

export function box(className, children = [], extra = {}) {
	return {
		tag: extra.tag || 'div',
		attr: { class: className, ...(extra.attr || {}) },
		...(extra.ref ? { ref: extra.ref } : {}),
		...(extra.events ? { events: extra.events } : {}),
		children
	};
}

export function button(label, ariaLabel, click, attr = {}, ref) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
			...attr
		},
		...(ref ? { ref } : {}),
		children: [label],
		events: click ? { click } : {}
	};
}

export function link(href, label, className, ariaLabel, events) {
	return {
		tag: 'a',
		attr: {
			href,
			...(className ? { class: className } : {}),
			...(ariaLabel ? { 'aria-label': ariaLabel } : {})
		},
		...(events ? { events } : {}),
		children: [label]
	};
}

export function input(id, label, ref, required = false) {
	return {
		tag: 'input',
		attr: {
			id,
			placeholder: label,
			...(required ? { required: true } : {})
		},
		ref
	};
}

export function option(value, label, selected = false) {
	return {
		tag: 'option',
		attr: { value, ...(selected ? { selected: true } : {}) },
		children: [label]
	};
}

export function labeledSelect({ id, label, ref, options, change }) {
	return box('living-path-field', [
		{ tag: 'label', attr: { for: id }, children: [label] },
		{
			tag: 'select',
			attr: { id },
			ref,
			children: options,
			events: change ? { change } : {}
		}
	]);
}

export function search(onInput) {
	return {
		tag: 'input',
		attr: {
			type: 'search',
			placeholder: 'Search this branch',
			'aria-label': 'Search the current Heichel branch',
			autocomplete: 'off'
		},
		ref: 'searchInput',
		events: { input: onInput }
	};
}

export function grid(type, listRef, loadRef, hidden = false) {
	return box(`viewport ${type} ${hidden ? 'hidden' : ''}`, [
		box('dynamic-grid', [], {
			attr: { 'aria-live': 'polite', 'aria-busy': 'false' },
			ref: listRef
		}),
		box('sacred-loading hidden', skeletonRows(), {
			attr: { 'aria-label': `Loading ${type}`, role: 'status' },
			ref: loadRef
		})
	], { ref: `${type}Viewport` });
}

export function tab(label, view, actions, active = false) {
	return button(label, `Show ${label}`, () => actions.switchView(view), {
		class: `tab ${active ? 'Active' : ''}`,
		role: 'tab',
		'aria-selected': String(active),
		'aria-controls': `${view}Viewport`
	}, `${view}Tab`);
}

function skeletonRows() {
	return Array.from({ length: 3 }, (_, index) => ({
		tag: 'article',
		attr: { class: 'living-path-skeleton', 'aria-hidden': 'true' },
		children: [
			{ tag: 'span', attr: { class: 'skeleton-orb' } },
			box('skeleton-lines', [
				{ tag: 'span' },
				{ tag: 'span' },
				{ tag: 'span', attr: { class: index === 1 ? 'short' : '' } }
			])
		]
	}));
}
