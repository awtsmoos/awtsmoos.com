// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ComposerMobileHierarchy
 * @description
 * The Awtsmoos places identity and common creative acts beside the writing canvas while Awtsmoos.com
 * routes each action into an existing truthful vessel; the publication door says Public because that is its real law.
 */
import { installMobileIdentity } from './mobileIdentity.js';

export const MOBILE_TOOLS = Object.freeze([
	['reel', '▶', 'Reel'],
	['media', '▧', 'Media'],
	['section', '§', 'Section'],
	['destination', '◇', 'Destination'],
	['audience', '◎', 'Public'],
	['preview', '◫', 'Preview']
]);

/** Installs writing-first tools without changing publication contracts. */
export function installMobileHierarchy() {
	const contentBody = document.querySelector('.contentPanel .majorPanelBody');
	if (!contentBody || contentBody.querySelector('.composer-social-tools')) return;
	const title = document.getElementById('title');
	if (title) title.placeholder = "What's on your mind?";
	const identity = installMobileIdentity(contentBody);
	const navigation = document.createElement('nav');
	navigation.className = 'composer-social-tools';
	navigation.setAttribute('aria-label', 'Post creation tools');
	navigation.innerHTML = MOBILE_TOOLS.map(toolMarkup).join('');
	navigation.addEventListener('click', handleToolClick);
	identity.insertAdjacentElement('afterend', navigation);
}

function toolMarkup([name, icon, label]) {
	return /*html*/`
		<button type="button" data-composer-tool="${name}" aria-label="${label}">
			<span aria-hidden="true">${icon}</span>
			${label}
		</button>
	`;
}

function handleToolClick(event) {
	const tool = event.target.closest('[data-composer-tool]')?.dataset.composerTool;
	if (!tool) return;
	const actions = {
		reel: () => document.querySelector('[data-reel-open]')?.click(),
		media: openMedia,
		section: addSection,
		destination: () => openPanel('.destinationPanel'),
		audience: () => openPanel('.publicationPanel'),
		preview: () => document.getElementById('mobilePreviewButton')?.click()
	};
	actions[tool]?.();
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

export { handleToolClick, toolMarkup };
