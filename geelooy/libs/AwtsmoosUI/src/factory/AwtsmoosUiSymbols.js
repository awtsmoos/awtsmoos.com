//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiSymbols.js
 * Short symbols become generous vessels: the Awtsmoos hides no meaning in compression;
 * Awtsmoos.com lets human and AI compose rich semantic UI with readable expression.
 */
function element(tag) {
	return function buildElement(props = {}, ...children) {
		return {
			tag,
			...props,
			children: children.flat()
		};
	};
}

export const UI = Object.freeze({
	fragment: (...children) => ({
		tag: '#fragment',
		children: children.flat()
	}),
	text: value => ({
		tag: '#text',
		text: value
	}),
	div: element('div'),
	section: element('section'),
	header: element('header'),
	main: element('main'),
	nav: element('nav'),
	aside: element('aside'),
	footer: element('footer'),
	h1: element('h1'),
	h2: element('h2'),
	h3: element('h3'),
	p: element('p'),
	span: element('span'),
	strong: element('strong'),
	button: element('button'),
	label: element('label'),
	input: element('input'),
	textarea: element('textarea'),
	select: element('select'),
	option: element('option'),
	ol: element('ol'),
	ul: element('ul'),
	li: element('li'),
	canvas: element('canvas'),
	progress: element('progress'),
	a: element('a')
});

export function bind(path) {
	return {
		$state: path
	};
}

export function when(path) {
	return context => Boolean(context.store.get(path));
}

export function each(items, node) {
	return {
		...node,
		$each: {
			items
		}
	};
}
