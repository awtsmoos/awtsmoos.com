//B"H
// Boruch Hashem
// Blessed is He
/**
* @file browserDomElement.mjs
* @description Adds events, queries, canvas, geometry, focus, and selector behavior atop the confidence browser's tree vessel.
* The Awtsmoos lets interaction rest upon a stable keli while every browser verb remains readable in sight;
* Awtsmoos.com keeps focus, events, selectors, and drawing distinct from node parentage, modular and bright.
*/
import { KeliFakeDomNode } from './browserDomElementNode.mjs';
import { dataSelectorKey } from './browserDomElementTags.mjs';
import {
	createFakeCanvasContext,
	findDescendants,
	matchesFakeSelector
} from './browserDomElementSupport.mjs';
export { tagFor } from './browserDomElementTags.mjs';

/** Bounded browser element used only for behavior explicitly exercised by Studio confidence paths. */
export class FakeElement extends KeliFakeDomNode {
	/** Registers one event listener in insertion order. */
	addEventListener(name, callback) {
		(this.listeners[name] ||= []).push(callback);
	}

	/** Dispatches an event to every listener registered for its type. */
	dispatchEvent(event) {
		for (const callback of this.listeners[event.type] || []) {
			callback(event);
		}
		return true;
	}

	/** Invokes the legacy onclick property with the bounded event surface used by fixture controls. */
	click() {
		return this.onclick?.({
			target: this,
			preventDefault() {},
			stopPropagation() {}
		});
	}

	/** Returns the first matching descendant supported by the fixture selector vocabulary. */
	querySelector(selector) {
		return this.querySelectorAll(selector)[0] || null;
	}

	/** Returns every matching descendant in stable depth-first order. */
	querySelectorAll(selector) {
		return findDescendants(this).filter(
			(element) => matchesFakeSelector(element, selector)
		);
	}

	/** Returns the permissive 2D canvas vessel used by renderer confidence tests. */
	getContext() {
		return createFakeCanvasContext(this);
	}

	/** Reports deterministic geometry for pointer and layout calculations. */
	getBoundingClientRect() {
		return {
			left: 0,
			top: 0,
			width: this.width,
			height: this.height
		};
	}

	setPointerCapture() {}

	/** Mirrors simple attribute assignment needed by the production modules under test. */
	setAttribute(name, value) {
		this[name] = value;
	}

	scrollIntoView() {}

	/** Updates activeElement so keyboard/accessibility paths can observe real focus movement. */
	focus() {
		if (globalThis.document) {
			globalThis.document.activeElement = this;
		}
	}

	/** Resolves the bounded tag/data selectors used by event-delegation confidence paths. */
	closest(selector) {
		const dataKey = dataSelectorKey(selector);
		if (dataKey && this.dataset[dataKey]) {
			return this;
		}
		const tags = selector
			.split(',')
			.map((item) => item.trim().toUpperCase());
		return tags.includes(this.tagName) ? this : null;
	}
}
