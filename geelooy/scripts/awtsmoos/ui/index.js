// B"H
/**
 * @module AwtsmoosUi
 * @description
 * A small DOM-construction library for social pages and tools. It no longer
 * imports the game engine: Mail, EntityModule, and future interfaces receive a
 * browser-native vessel whose behavior can be inspected one module at a time.
 */
import { dispatchPeula, performHtmlAction } from './core/actions.js';
import { applyChildren, mountElement } from './core/children.js';
import { applyElementOptions, createElementNode } from './core/elementOptions.js';
import { allElements, deleteElement, getElement, registerElement } from './core/registry.js';

export default class UI {
	constructor() {
		this.events = Object.create(null);
	}

	get myHTMLElements() {
		return allElements();
	}

	/** Creates, mounts, configures, and returns one DOM element. */
	html(options = {}) {
		const element = this.makeHtml(options);
		mountElement(this, element, options);
		return this.setHtml(element, options);
	}

	/** Creates an unconfigured DOM element from a descriptor. */
	makeHtml(options = {}) {
		return createElementNode(options && typeof options === 'object' ? options : {});
	}

	/** Applies a descriptor to an existing element. */
	setHtml(element, options = {}) {
		if (!(element instanceof Node) || !options || typeof options !== 'object') return null;
		registerElement(options.shaym, element);
		applyElementOptions(element, options, this);
		applyChildren(this, element, options);
		element.af = element.awtsmoosFind = this.getHtml.bind(this);
		element.getElements = allElements;
		if (typeof options.ready === 'function') options.ready(element, this.getHtml.bind(this), this);
		return element;
	}

	/** Applies a descriptor to a registered element. */
	setHtmlByShaym(shaym, options = {}) {
		const element = this.getHtml(shaym);
		return element ? this.setHtml(element, options) : null;
	}

	/** Returns a registered element. */
	getHtml(shaym) {
		return getElement(shaym);
	}

	/** Removes a registered element. */
	deleteHtml(shaym) {
		return deleteElement(shaym);
	}

	/** Dispatches custom DOM peulos on an element or registered shaym. */
	peula(elementOrShaym, details = {}, id = null) {
		return dispatchPeula(this, elementOrShaym, details, id);
	}

	/** Applies properties and methods to a selected element. */
	htmlAction(options = {}) {
		return performHtmlAction(this, options);
	}

	/** Compatibility alias for html. */
	$h(options) {
		return this.html(options);
	}

	/** Compatibility alias for htmlAction. */
	$ha(options) {
		return this.htmlAction(options);
	}

	/** Compatibility alias for setHtml. */
	$s(element, options) {
		return this.setHtml(element, options);
	}

	/** Compatibility alias for getHtml. */
	$g(shaym) {
		return this.getHtml(shaym);
	}

	/** Preserves the historic parseElement shape for callers that inspect it. */
	parseElement(element) {
		return {
			tag: element?.tagName?.toLowerCase() || null,
			attributes: element ? Array.from(element.attributes || []) : [],
			children: element ? Array.from(element.childNodes || []) : []
		};
	}
}

if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.cheepawysh) {
	HTMLElement.prototype.cheepawysh = function cheepawysh(ui, shaym) {
		return typeof ui?.getHtml === 'function' ? ui.getHtml(shaym) : null;
	};
}
