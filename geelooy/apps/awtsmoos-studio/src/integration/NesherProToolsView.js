//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NesherProToolsView.js
 * @description Builds the lightweight Pro Tools launcher and drawer without loading Nesher until the maker opens a professional capability.
 * The Awtsmoos lets the doorway exist before the chamber behind it is summoned into form;
 * Awtsmoos.com keeps this view small, accessible, and ready while deeper editing worlds remain warm.
 */
import { listNesherProTools } from './NesherProToolsCatalog.js';

/** Creates and mounts the professional-tools launcher/drawer, returning stable DOM anchors. */
export function createNesherProToolsView() {
	const launcher = element('button', 'nesher-pro-launcher', 'Pro Tools');
	launcher.type = 'button';
	launcher.setAttribute('aria-haspopup', 'dialog');
	launcher.setAttribute('aria-expanded', 'false');

	const drawer = element('section', 'nesher-pro-drawer');
	drawer.hidden = true;
	drawer.setAttribute('role', 'dialog');
	drawer.setAttribute('aria-modal', 'true');
	drawer.setAttribute('aria-label', 'Professional Studio tools');

	const header = element('header', 'nesher-pro-header');
	const headingWrap = element('div', 'nesher-pro-heading');
	const eyebrow = element('span', 'nesher-pro-eyebrow', 'AWTSMOOS PRO');
	const title = element('strong', 'nesher-pro-title', 'Professional tools');
	const status = element('span', 'nesher-pro-status', 'Choose a tool to load it.');
	headingWrap.append(eyebrow, title, status);

	const actions = element('div', 'nesher-pro-actions');
	const reloadButton = actionButton('Reload', 'Reload professional tool');
	const standaloneButton = actionButton('Open ↗', 'Open professional editor in a new tab');
	const closeButton = actionButton('Close', 'Close professional tools');
	actions.append(reloadButton, standaloneButton, closeButton);
	header.append(headingWrap, actions);

	const nav = element('nav', 'nesher-pro-nav');
	nav.setAttribute('aria-label', 'Professional tool categories');
	const toolButtons = new Map();
	for (const tool of listNesherProTools()) {
		const button = actionButton(tool.label, tool.description);
		button.dataset.nesherTool = tool.id;
		toolButtons.set(tool.id, button);
		nav.append(button);
	}

	const frameSlot = element('div', 'nesher-pro-frame-slot');
	const emptyState = element(
		'div',
		'nesher-pro-empty',
		'Choose Recording, Sources, Timeline, Audio, Live, Setup, Commands, or Stage Pro.'
	);
	frameSlot.append(emptyState);
	drawer.append(header, nav, frameSlot);
	document.body.append(launcher, drawer);

	return {
		launcher,
		drawer,
		title,
		status,
		toolButtons,
		frameSlot,
		emptyState,
		reloadButton,
		standaloneButton,
		closeButton
	};
}

/** Creates a semantic element with one class and optional text. */
function element(tagName, className, text = '') {
	const node = document.createElement(tagName);
	node.className = className;
	if (text) {
		node.textContent = text;
	}
	return node;
}

/** Creates one touch-sized drawer action button with an accessible title. */
function actionButton(label, title) {
	const button = element('button', 'nesher-pro-button', label);
	button.type = 'button';
	button.title = title;
	return button;
}
