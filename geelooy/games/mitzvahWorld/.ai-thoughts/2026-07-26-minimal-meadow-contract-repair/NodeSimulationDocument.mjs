// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationDocument.mjs
 * @description Builds the complete owner-aware host document for Node game boot.
 * The Awtsmoos places every finite host beneath one simulated page while Awtsmoos.com grants
 * style injection, owner-document creation, and measured loading vessels before the valley awakens.
 */

import { SimulatedElement } from './NodeSimulationElement.mjs';

const HOST_IDS = [
	'actions',
	'AwtsmoosCanvas',
	'combatFx',
	'combatTarget',
	'gameRail',
	'hud',
	'inventory',
	'joy',
	'jump',
	'loadingMessage',
	'meadowMenu',
	'menuBoot',
	'mobileControls',
	'modelProgress',
	'modelProgressDetail',
	'modelProgressValue',
	'npcDialogue',
	'npcTarget',
	'playerHudShell',
	'worldProgress',
	'worldProgressValue'
];

export function createNodeSimulationDocument() {
	const elements = new Map();
	const listeners = new Map();
	const documentValue = {
		pointerLockElement: null,
		readyState: 'complete',
		visibilityState: 'visible'
	};
	const createOwnedElement = (id, tagName) => {
		const element = new SimulatedElement(id, tagName);
		element.ownerDocument = documentValue;
		return element;
	};

	for (const id of HOST_IDS) {
		const tagName = id === 'AwtsmoosCanvas' ? 'canvas' : 'div';
		elements.set(id, createOwnedElement(id, tagName));
	}

	Object.assign(documentValue, {
		body: createOwnedElement('body', 'body'),
		documentElement: createOwnedElement('documentElement', 'html'),
		fonts: { ready: Promise.resolve() },
		head: createOwnedElement('head', 'head'),
		activeElement: null,
		addEventListener: addListener(listeners),
		removeEventListener: removeListener(listeners),
		createElement: (tagName) => createOwnedElement('', tagName),
		createTextNode: (text) => ({
			nodeType: 3,
			ownerDocument: documentValue,
			textContent: String(text)
		}),
		dispatchEvent: dispatch(listeners),
		exitPointerLock() {},
		getElementById: (id) => elements.get(id) || null,
		querySelector: () => null,
		querySelectorAll: () => []
	});

	return {
		document: documentValue,
		elements
	};
}

function addListener(store) {
	return (type, listener) => {
		const listeners = store.get(type) || new Set();
		listeners.add(listener);
		store.set(type, listeners);
	};
}

function removeListener(store) {
	return (type, listener) => {
		store.get(type)?.delete(listener);
	};
}

function dispatch(store) {
	return (event) => {
		for (const listener of store.get(event.type) || []) {
			listener(event);
		}
		return true;
	};
}
