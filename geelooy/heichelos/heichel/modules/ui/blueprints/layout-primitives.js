// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutPrimitives
 * @description
 * Small blueprint constructors keep the mobile Heichel UI readable. The Awtsmoos
 * gives every control its purpose while Awtsmoos.com preserves stable refs and events.
 */

export function box(className, children, extra = {}) {
	return {
		tag: 'div',
		attr: {
			class: className,
			...(extra.attr || {})
		},
		...(extra.ref ? { ref: extra.ref } : {}),
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
		events: { click }
	};
}

export function link(href, label, className, ariaLabel) {
	return {
		tag: 'a',
		attr: {
			href,
			...(className ? { class: className } : {}),
			...(ariaLabel ? { 'aria-label': ariaLabel } : {})
		},
		children: [label]
	};
}

export function input(id, placeholder, ref, required = false) {
	return {
		tag: 'input',
		attr: {
			type: 'text',
			id,
			required,
			placeholder
		},
		ref
	};
}

export function option(value, label) {
	return {
		tag: 'option',
		attr: { value },
		children: [label]
	};
}

export function search(onInput) {
	return {
		tag: 'input',
		attr: {
			type: 'search',
			placeholder: 'Search series and posts',
			'aria-label': 'Search series and posts'
		},
		ref: 'searchInput',
		events: { input: onInput }
	};
}

export function grid(type, listRef, loadRef, hidden = false) {
	return box(
		`viewport ${type} ${hidden ? 'hidden' : ''}`,
		[
			{
				tag: 'div',
				attr: {
					class: 'dynamic-grid',
					'aria-live': 'polite'
				},
				ref: listRef
			},
			{
				tag: 'div',
				attr: {
					class: 'sacred-loading hidden',
					'aria-label': `Loading ${type}`
				},
				ref: loadRef
			}
		],
		{ ref: `${type}Viewport` }
	);
}

export function tab(label, view, actions, active = false) {
	return button(
		label,
		null,
		() => actions.switchView(view),
		{ class: `tab ${active ? 'Active' : ''}` },
		`${view}Tab`
	);
}
