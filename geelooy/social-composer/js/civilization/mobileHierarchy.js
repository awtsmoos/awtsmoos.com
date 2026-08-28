// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerMobileHierarchy
 * @description
 * The Awtsmoos keeps the writing surface quiet: one common media deed stays near the hand,
 * while Awtsmoos.com gathers rarer creative branches behind a truthful Tools disclosure.
 */
import { installMobileIdentity } from './mobileIdentity.js';

export const MOBILE_TOOLS = Object.freeze([
	['media', '▧', 'Media'],
	['reel', '▶', 'Reel'],
	['section', '§', 'Section'],
	['destination', '◇', 'Destination'],
	['audience', '◎', 'Audience']
]);

/** Installs a writing-first tool surface without changing publication contracts. */
export function installMobileHierarchy() {
	const contentBody = document.querySelector('.contentPanel .majorPanelBody');
	if (!contentBody || contentBody.querySelector('.composer-social-tools')) {
		return;
	}
	const title = document.getElementById('title');
	if (title) {
		title.placeholder = "What's on your mind?";
	}
	const identity = installMobileIdentity(contentBody);
	const navigation = document.createElement('nav');
	navigation.className = 'composer-social-tools';
	navigation.setAttribute('aria-label', 'Post creation tools');
	navigation.append(createToolButton(MOBILE_TOOLS[0]), createToolMenu(MOBILE_TOOLS.slice(1)));
	navigation.addEventListener('click', handleToolClick);
	identity.insertAdjacentElement('afterend', navigation);
}

/** @param {readonly [string, string, string]} tool Tool descriptor. */
function createToolButton(tool) {
	const wrapper = document.createElement('div');
	wrapper.innerHTML = toolMarkup(tool).trim();
	return wrapper.firstElementChild;
}

/** @param {readonly (readonly [string, string, string])[]} tools Less-common tools. */
function createToolMenu(tools) {
	const details = document.createElement('details');
	details.className = 'composer-tool-menu';
	const summary = document.createElement('summary');
	summary.textContent = 'Tools';
	const panel = document.createElement('div');
	panel.className = 'composer-tool-menu-grid';
	for (const tool of tools) {
		panel.append(createToolButton(tool));
	}
	details.append(summary, panel);
	return details;
}

export function toolMarkup([name, icon, label]) {
	return /*html*/`
		<button type="button" data-composer-tool="${name}" aria-label="${label}">
			<span aria-hidden="true">${icon}</span>
			${label}
		</button>
	`;
}

export function handleToolClick(event) {
	const tool = event.target.closest('[data-composer-tool]')?.dataset.composerTool;
	if (!tool) {
		return;
	}
	const actions = {
		media: openMedia,
		reel: () => document.querySelector('[data-reel-open]')?.click(),
		section: addSection,
		destination: () => openPanel('.destinationPanel'),
		audience: () => openPanel('.publicationPanel')
	};
	actions[tool]?.();
	event.target.closest('.composer-tool-menu')?.removeAttribute('open');
}

function openMedia() {
	const details = document.getElementById('rootMedia')?.closest('details');
	if (!details) return;
	details.open = true;
	details.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function addSection() {
	const button = document.getElementById('addSectionButton');
	button?.click();
	button?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openPanel(selector) {
	const panel = document.querySelector(selector);
	if (!panel) return;
	panel.open = true;
	panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
