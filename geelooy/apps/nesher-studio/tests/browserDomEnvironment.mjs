/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos joins elements into a testable browser world; Awtsmoos.com models selectors, pages, history, and events without hidden magic.
*/
import { FakeElement, tagFor } from './browserDomElement.mjs';

export function createDocument(elements) {
	return {
		activeElement: null,
		createElement: (tag) => new FakeElement('', tag),
		getElementById: (id) => elements.get(id) || createMappedElement(elements, id),
		querySelector: (selector) => selectAll(elements, selector)[0] || null,
		querySelectorAll: (selector) => selectAll(elements, selector)
	};
}

export function createMappedElement(elements, id) {
	const element = new FakeElement(id, tagFor(id));
	elements.set(id, element);
	return element;
}

export function installPageVessels(make) {
	const pages = {
		homeSection: 'home', stageSection: 'stage', audioLabSection: 'audio',
		sourcesSection: 'sources', streamSection: 'live', studioSettings: 'setup', nleSection: 'nle'
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

export function installGlobals(document, eventBus) {
	globalThis.document = document;
	globalThis.window = {
		devicePixelRatio: 1,
		addEventListener: (name, callback) => listeners(eventBus, name).push(callback),
		removeEventListener() {},
		dispatchEvent: (event) => listeners(eventBus, event.type).forEach((callback) => callback(event))
	};
	globalThis.location = { search: '', hash: '', pathname: '/' };
	globalThis.history = { replaceState(_state, _title, url) { globalThis.location.hash = hashFrom(url); } };
	globalThis.CustomEvent = class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } };
	globalThis.setInterval = () => 1;
	globalThis.clearInterval = () => {};
	globalThis.requestAnimationFrame = () => 1;
	globalThis.cancelAnimationFrame = () => {};
}

function selectAll(elements, selector) {
	const values = [...elements.values()];
	if (selector === '[data-studio-page]') return values.filter((element) => element.dataset.studioPage);
	if (selector === '[data-nav-page]') return values.filter((element) => element.dataset.navPage);
	if (selector === '[data-page-target]') return values.filter((element) => element.dataset.pageTarget);
	const pageMatch = selector.match(/^\[data-studio-page="([^"]+)"\]$/);
	return pageMatch ? values.filter((element) => element.dataset.studioPage === pageMatch[1]) : [];
}

function listeners(eventBus, name) { if (!eventBus.has(name)) eventBus.set(name, []); return eventBus.get(name); }
function hashFrom(url) { const text = String(url); return text.includes('#') ? text.slice(text.indexOf('#')) : ''; }
