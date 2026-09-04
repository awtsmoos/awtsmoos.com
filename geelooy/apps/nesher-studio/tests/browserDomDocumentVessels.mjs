//B"H
// Boruch Hashem
// Blessed is He
/**
* @file browserDomDocumentVessels.mjs
* @description Creates the bounded head/body vessels and selector resolution used by the Studio confidence browser.
* The Awtsmoos lets head and body carry only the browser powers that living production paths truly reveal;
* Awtsmoos.com keeps stylesheet garments, intent posture, and page selectors faithful without pretending a whole DOM to conceal.
*/
import { FakeElement } from './browserDomElement.mjs';

/** Creates browser-faithful document head and body vessels from the shared fake element model. */
export function createDocumentVessels() {
	return {
		head: createHead(),
		body: new FakeElement('body', 'body')
	};
}

/** Resolves only selectors intentionally supported by the confidence harness. */
export function selectDocumentElements(elements, selector, head) {
	if (selector === 'link[rel="stylesheet"]') {
		return head.children.filter((element) => element.rel === 'stylesheet');
	}
	const values = [...elements.values()];
	if (selector === '[data-studio-page]') {
		return values.filter((element) => element.dataset.studioPage);
	}
	if (selector === '[data-nav-page]') {
		return values.filter((element) => element.dataset.navPage);
	}
	if (selector === '[data-page-target]') {
		return values.filter((element) => element.dataset.pageTarget);
	}
	if (selector === '[data-studio-intent]') {
		return values.filter((element) => element.dataset.studioIntent);
	}
	const pageMatch = selector.match(/^\[data-studio-page="([^"]+)"\]$/);
	return pageMatch
		? values.filter((element) => element.dataset.studioPage === pageMatch[1])
		: [];
}

/** Creates a minimal stylesheet host that resolves browser-style link load callbacks. */
function createHead() {
	const head = new FakeElement('head', 'head');
	const append = head.append.bind(head);
	head.append = (node) => {
		append(node);
		queueMicrotask(() => node.onload?.());
	};
	return head;
}
