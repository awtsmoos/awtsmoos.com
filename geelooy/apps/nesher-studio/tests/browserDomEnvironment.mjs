//B"H
// Boruch Hashem
// Blessed is He
/**
* @file browserDomEnvironment.mjs
* @description Builds browser globals and page vessels while delegating document structure to focused fake-DOM vessels.
* The Awtsmoos gives each simulated browser chamber only the power its confidence path needs;
* Awtsmoos.com keeps globals, pages, and document vessels separate so the harness grows by modules rather than tangled weeds.
*/
import { FakeElement, tagFor } from './browserDomElement.mjs';
import {
	createDocumentVessels,
	selectDocumentElements
} from './browserDomDocumentVessels.mjs';

/** Creates a bounded fake document with page selectors plus stylesheet-aware head and body vessels. */
export function createDocument(elements) {
	const { head, body } = createDocumentVessels();
	return {
		head,
		body,
		activeElement: null,
		createElement: (tag) => new FakeElement('', tag),
		getElementById: (id) => elements.get(id) || createMappedElement(elements, id),
		querySelector: (selector) => selectDocumentElements(elements, selector, head)[0] || null,
		querySelectorAll: (selector) => selectDocumentElements(elements, selector, head)
	};
}

/** Creates and remembers one fixture element with the same tag inference used by the real harness. */
export function createMappedElement(elements, id) {
	const element = new FakeElement(id, tagFor(id));
	elements.set(id, element);
	return element;
}

/** Installs page vessels plus legacy nav markers still exercised by older navigation tests. */
export function installPageVessels(make) {
	const pages = {
		homeSection: 'home',
		stageSection: 'stage',
		audioLabSection: 'audio',
		sourcesSection: 'sources',
		streamSection: 'live',
		studioSettings: 'setup',
		nleSection: 'nle'
	};
	Object.entries(pages).forEach(([id, page]) => {
		const element = make(id);
		element.dataset.studioPage = page;
		element.hidden = page !== 'home';
	});
	['navHome', 'navStage', 'navAudio', 'navSources', 'navLive', 'navSetup', 'navNle'].forEach((id) => {
		const element = make(id);
		element.dataset.navPage = id.replace('nav', '').toLowerCase();
	});
}

/** Installs the global browser-shaped APIs required by Studio boot and navigation. */
export function installGlobals(document, eventBus) {
	globalThis.document = document;
	globalThis.window = {
		devicePixelRatio: 1,
		addEventListener: (name, callback) => listeners(eventBus, name).push(callback),
		removeEventListener() {},
		dispatchEvent: (event) => listeners(eventBus, event.type).forEach((callback) => callback(event))
	};
	globalThis.location = {
		search: '',
		hash: '',
		pathname: '/'
	};
	globalThis.history = {
		replaceState(_state, _title, url) {
			globalThis.location.hash = hashFrom(url);
		}
	};
	globalThis.CustomEvent = class {
		constructor(type, options = {}) {
			this.type = type;
			this.detail = options.detail;
		}
	};
	globalThis.setInterval = () => 1;
	globalThis.clearInterval = () => {};
	globalThis.requestAnimationFrame = () => 1;
	globalThis.cancelAnimationFrame = () => {};
}

/** Returns the listener bucket for one simulated window event. */
function listeners(eventBus, name) {
	if (!eventBus.has(name)) {
		eventBus.set(name, []);
	}
	return eventBus.get(name);
}

/** Extracts a hash from one navigation URL without modeling the full URL API. */
function hashFrom(url) {
	const text = String(url);
	return text.includes('#')
		? text.slice(text.indexOf('#'))
		: '';
}
