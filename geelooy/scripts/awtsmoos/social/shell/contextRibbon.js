// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyContextRibbon
 * @description
 * Beneath the Horizon, the Awtsmoos reveals one truthful coordinate ribbon for
 * Awtsmoos.com. It never replaces the page heading or fabricates route identity.
 */
import { createContextModel } from './contextModel.js';

let pendingContext = null;

/** Creates the hidden shell-owned context vessel. */
export function createContextRibbon(root = document) {
	const ribbon = root.createElement('section');
	ribbon.className = 'g-context-ribbon';
	ribbon.dataset.gContextRibbon = 'true';
	ribbon.setAttribute('aria-labelledby', 'g-context-title');
	ribbon.hidden = true;
	ribbon.append(
		part(root, 'div', 'g-context-trail', 'trail'),
		part(root, 'div', 'g-context-identity', 'identity'),
		part(root, 'div', 'g-context-state', 'state'),
		part(root, 'div', 'g-context-actions', 'actions')
	);
	if (pendingContext) renderContextRibbon(ribbon, pendingContext);
	return ribbon;
}

/** Publishes observed route context into the shared shell. */
export function publishRouteContext(input, root = document) {
	pendingContext = createContextModel(input);
	const ribbon = root.querySelector('[data-g-context-ribbon]');
	if (ribbon) renderContextRibbon(ribbon, pendingContext);
	return pendingContext;
}

/** Clears route context when a page has no deep coordinate. */
export function clearRouteContext(root = document) {
	pendingContext = null;
	const ribbon = root.querySelector('[data-g-context-ribbon]');
	if (ribbon) renderContextRibbon(ribbon, null);
}

/** Renders a normalized context without introducing mutation controls. */
export function renderContextRibbon(ribbon, model) {
	if (!ribbon) return;
	const root = ribbon.ownerDocument;
	if (!model) {
		ribbon.hidden = true;
		root.body?.removeAttribute('data-g-context-visible');
		return;
	}
	renderTrail(ribbon, model);
	renderIdentity(ribbon, model);
	renderState(ribbon, model);
	renderActions(ribbon, model);
	ribbon.dataset.state = model.state;
	ribbon.hidden = false;
	root.body?.setAttribute('data-g-context-visible', 'true');
}

function renderTrail(ribbon, model) {
	const trail = slot(ribbon, 'trail');
	const links = [model.parent, ...model.breadcrumbs].filter(Boolean);
	trail.replaceChildren(...links.flatMap((link, index) => {
		const nodes = [anchor(ribbon.ownerDocument, link, 'g-context-parent')];
		if (index < links.length - 1) nodes.push(text(ribbon.ownerDocument, 'span', '›', 'g-context-separator'));
		return nodes;
	}));
	trail.hidden = links.length === 0;
}

function renderIdentity(ribbon, model) {
	const identity = slot(ribbon, 'identity');
	const type = text(ribbon.ownerDocument, 'small', model.type, 'g-context-type');
	const title = text(ribbon.ownerDocument, 'strong', model.title, 'g-context-title');
	title.id = 'g-context-title';
	const details = text(ribbon.ownerDocument, 'span', model.details.join(' · '), 'g-context-details');
	details.hidden = model.details.length === 0;
	identity.replaceChildren(type, title, details);
}

function renderState(ribbon, model) {
	const state = slot(ribbon, 'state');
	state.replaceChildren(text(ribbon.ownerDocument, 'span', model.stateLabel, 'g-context-state-label'));
}

function renderActions(ribbon, model) {
	const actions = slot(ribbon, 'actions');
	actions.replaceChildren(...model.actions.map(link => anchor(ribbon.ownerDocument, link, 'g-context-action')));
	actions.hidden = model.actions.length === 0;
}

function part(root, tag, className, name) {
	const node = root.createElement(tag);
	node.className = className;
	node.dataset.contextPart = name;
	return node;
}

function slot(ribbon, name) {
	return ribbon.querySelector(`[data-context-part="${name}"]`);
}

function anchor(root, link, className) {
	const node = text(root, 'a', link.label, className);
	node.href = link.href;
	return node;
}

function text(root, tag, value, className) {
	const node = root.createElement(tag);
	node.className = className;
	node.textContent = value;
	return node;
}
