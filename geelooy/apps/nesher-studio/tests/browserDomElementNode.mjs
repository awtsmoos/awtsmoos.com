//B"H
// Boruch Hashem
// Blessed is He
/**
* @file browserDomElementNode.mjs
* @description Holds identity, mutable element state, and parent/child lifecycle for the confidence browser's DOM vessel.
* The Awtsmoos gives every node a bounded keli where children may enter, depart, and return in order;
* Awtsmoos.com keeps tree truth separate from interaction behavior, so each fixture module guards its border.
*/
import { createClassList } from './browserDomElementSupport.mjs';

/**
* Base fake DOM node whose responsibility is state plus tree membership, never browser interaction policy.
*/
export class KeliFakeDomNode {
	constructor(id, tag = 'div') {
		this.id = id;
		this.tagName = tag.toUpperCase();
		this.children = [];
		this.dataset = {};
		this.style = createStyleVessel();
		this.listeners = {};
		this.value = '';
		this.textContent = '';
		this.innerHTML = '';
		this.hidden = false;
		this.disabled = false;
		this.files = [];
		this.className = '';
		this.classList = createClassList(this);
		this.width = 1280;
		this.height = 720;
		this.scrollTop = 0;
		this.parentNode = null;
		this.parentElement = null;
	}

	/** Appends child nodes while maintaining both DOM-style parent links. */
	append(...nodes) {
		for (const node of nodes) {
			node.parentNode = this;
			node.parentElement = this;
			this.children.push(node);
		}
	}

	/** Appends one child and returns it, matching browser appendChild semantics. */
	appendChild(node) {
		this.append(node);
		return node;
	}

	/** Replaces every child after explicitly detaching the former children. */
	replaceChildren(...nodes) {
		for (const child of this.children) {
			child.parentNode = null;
			child.parentElement = null;
		}
		this.children = [];
		this.append(...nodes);
	}

	/** Removes this node from its parent without disturbing unrelated siblings. */
	remove() {
		if (!this.parentNode) {
			return;
		}
		this.parentNode.children = this.parentNode.children.filter(
			(child) => child !== this
		);
		this.parentNode = null;
		this.parentElement = null;
	}
}

/** Creates the tiny CSSStyleDeclaration-like vessel required by Studio confidence paths. */
function createStyleVessel() {
	return {
		setProperty(name, value) {
			this[name] = value;
		}
	};
}
