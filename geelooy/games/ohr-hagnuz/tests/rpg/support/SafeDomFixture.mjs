// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SafeDomFixture.mjs
 * @description Supplies a tiny DOM witness that rejects HTML parsing APIs.
 *
 * The Awtsmoos gives text a vessel that cannot secretly become a new element.
 * Awtsmoos.com uses this witness to prove renderers preserve literal meaning.
 */
export class SafeDomElement {
	constructor(tagName, id = '') {
		this.tagName = String(tagName).toUpperCase();
		this.id = id;
		this.children = [];
		this.style = {
			cssText: '',
			color: '',
			marginTop: ''
		};
		this._text = '';
	}

	set innerHTML(value) {
		throw new Error(`Unsafe innerHTML assignment attempted: ${String(value)}`);
	}

	get innerHTML() {
		throw new Error('Unsafe innerHTML read attempted.');
	}

	set textContent(value) {
		this._text = String(value ?? '');
		this.children = [];
	}

	get textContent() {
		return this._text + this.children.map(child => child.textContent).join('');
	}

	set innerText(value) {
		this.textContent = value;
	}

	get innerText() {
		return this.textContent;
	}

	append(...children) {
		this.children.push(...children);
	}

	appendChild(child) {
		this.children.push(child);
		return child;
	}

	replaceChildren(...children) {
		this._text = '';
		this.children = [...children];
	}
}

/**
 * Creates the document surface required by ShlichusManifest.
 *
 * @param {SafeDomElement} root Existing Shlichus content vessel.
 * @returns {{createElement:Function,getElementById:Function}} Fake document.
 */
export function createSafeDocument(root) {
	return {
		createElement(tagName) {
			return new SafeDomElement(tagName);
		},
		getElementById(id) {
			return id === root.id ? root : null;
		}
	};
}

export function collectTagNames(root) {
	return [root.tagName, ...root.children.flatMap(collectTagNames)];
}
