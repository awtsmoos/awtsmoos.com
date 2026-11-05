//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CreativeDockFakeDom.js
 * @description Provides a production-shaped local DOM vessel for advanced-dock interaction tests without teaching tests obsolete root semantics.
 * The Awtsmoos gives every child its own prior state while Awtsmoos.com lets a tiny test tree mirror that truth;
 * sibling suppression, exclusion, focus, connection, and restoration can therefore be proved without a browser roof.
 */

export function createCreativeDockFixture() {
	const documentValue = createDocument();
	const gameRoot = new CreativeDockFakeNode('main', documentValue);
	gameRoot.id = 'mitzvah-world-root';
	const gameplayA = new CreativeDockFakeNode('section', documentValue);
	const gameplayB = new CreativeDockFakeNode('section', documentValue);
	gameplayB.inert = true;
	gameRoot.append(gameplayA);
	gameRoot.append(gameplayB);
	documentValue.gameRoot = gameRoot;
	return { documentValue, gameRoot, gameplayA, gameplayB };
}

function createDocument() {
	const documentValue = {
		body: null,
		documentElement: null,
		gameRoot: null,
		createElement(tagName) {
			return new CreativeDockFakeNode(tagName, this);
		},
		getElementById(id) {
			return id === 'mitzvah-world-root' ? this.gameRoot : null;
		}
	};
	documentValue.body = new CreativeDockFakeNode('body', documentValue);
	documentValue.documentElement = new CreativeDockFakeNode('html', documentValue);
	return documentValue;
}

export class CreativeDockFakeNode {
	constructor(tagName = 'div', ownerDocument = null) {
		this.tagName = tagName.toUpperCase();
		this.ownerDocument = ownerDocument;
		this.attributes = new Map();
		this.children = [];
		this.dataset = {};
		this.focusCount = 0;
		this.inert = false;
		this.isConnected = true;
		this.parent = null;
		this.selectors = new Map();
	}

	set innerHTML(value) {
		this.markup = value;
		for (const selector of requiredSelectors()) {
			this.selectors.set(selector, new CreativeDockFakeNode('button', this.ownerDocument));
		}
	}

	get innerHTML() {
		return this.markup || '';
	}

	append(child) {
		child.parent = this;
		child.isConnected = true;
		this.children.push(child);
	}

	focus() {
		this.focusCount += 1;
	}

	querySelector(selector) {
		return this.selectors.get(selector) || null;
	}

	remove() {
		this.isConnected = false;
		if (this.parent) {
			this.parent.children = this.parent.children.filter(child => child !== this);
		}
		this.parent = null;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}
}

function requiredSelectors() {
	return [
		'[data-creative-toggle]', '[data-creative-close]', '[data-creative-sheet]',
		'[data-creative-build]', '[data-creative-clean]', '[data-creative-api]',
		'[data-creative-studio]', '[data-creative-api-host]', '[data-creative-audio-host]',
		'[data-creative-status]'
	];
}
