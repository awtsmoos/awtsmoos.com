// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ResponsivePanels
 * @description
 * The Awtsmoos reveals one deliberate editorial chamber first; Awtsmoos.com permits
 * wider Advanced work to expand only by explicit human choice, never by automatic visual explosion.
 */
import { currentComposerMode } from './composerModes.js';
import { isFocusedComposer, observeComposerWidth } from './composerViewport.js';
import { installPreviewSheet } from './previewSheet.js';

export { closePreviewSheet, openPreviewSheet } from './previewSheet.js';

/**
 * Normalizes major editorial panels according to mode and usable composer width.
 * @param {{preferContent?: boolean}} options Initialization may explicitly prefer the content panel.
 */
export function configureMajorPanels({ preferContent = false } = {}) {
	const panels = majorPanels();
	if (!panels.length) return;
	const opened = panels.filter(panel => panel.open);
	const mustFocus = preferContent || isFocusedComposer() || currentComposerMode() === 'simple';
	if (!mustFocus && opened.length) return;
	const target = !preferContent && opened.length === 1
		? opened[0]
		: contentPanel(panels);
	panels.forEach(panel => panel.open = panel === target);
}

/** @param {Event} event Keeps focused/Simple layouts to one open major panel. */
function collapseSiblingMajorPanels(event) {
	const activePanel = event.currentTarget;
	if (!activePanel.open || allowManualExpansion()) return;
	majorPanels().forEach(panel => panel.open = panel === activePanel);
}

function majorPanels() {
	return [...document.querySelectorAll('.majorPanel')];
}

function contentPanel(panels) {
	return panels.find(panel => panel.dataset.mobilePanel === 'content') || panels[0];
}

function allowManualExpansion() {
	return !isFocusedComposer() && currentComposerMode() === 'advanced';
}

function reconcileResponsiveState() {
	if (!allowManualExpansion()) {
		configureMajorPanels();
	}
}

/** Installs one-panel defaults, responsive reconciliation, and preview-sheet behavior. */
export function installResponsivePanels() {
	configureMajorPanels({ preferContent: true });
	for (const panel of majorPanels()) {
		panel.addEventListener('toggle', collapseSiblingMajorPanels);
	}
	observeComposerWidth(reconcileResponsiveState);
	window.addEventListener('awtsmoosComposerMode', reconcileResponsiveState);
	installPreviewSheet();
}
