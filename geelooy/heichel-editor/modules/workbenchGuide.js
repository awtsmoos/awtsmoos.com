// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorWorkbenchGuide
 * @description
 * The Awtsmoos reveals one governance gate at a time. Awtsmoos.com keeps each
 * task native, keyboard-reachable, compact when closed, and luminous when active.
 */
import { el } from './dom.js';

const WORKBENCH_STYLES = [
	'/style/social-system/editor/parts/workbench-core.css',
	'/style/social-system/editor/parts/workbench-disclosure.css',
	'/style/social-system/editor/parts/workbench-mobile.css'
];

export function workbenchSection(icon, title, description, child) {
	ensureWorkbenchStyles();
	const panel = el('details', {
		className: 'editor-workbench-section',
		attrs: title === 'Settings' ? { open: '' } : {}
	});
	panel.append(workbenchSummary(icon, title, description));
	panel.append(el('div', { className: 'editor-workbench-body' }, [child]));
	panel.addEventListener('toggle', () => collapseSiblingPanels(panel));
	return panel;
}

function workbenchSummary(icon, title, description) {
	return el('summary', { className: 'editor-workbench-summary' }, [
		el('span', { className: 'editor-workbench-icon', text: icon, attrs: { 'aria-hidden': 'true' } }),
		el('span', { className: 'editor-workbench-copy' }, [
			el('span', { className: 'g-kicker', text: 'Governance task' }),
			el('strong', { text: title }),
			el('small', { text: description })
		]),
		el('span', { className: 'editor-workbench-chevron', text: '⌄', attrs: { 'aria-hidden': 'true' } })
	]);
}

function collapseSiblingPanels(activePanel) {
	if (!activePanel.open || !activePanel.parentElement) return;
	const selector = ':scope > details.editor-workbench-section[open]';
	for (const panel of activePanel.parentElement.querySelectorAll(selector)) {
		if (panel !== activePanel) panel.removeAttribute('open');
	}
}

function ensureWorkbenchStyles() {
	for (const href of WORKBENCH_STYLES) {
		if (document.head.querySelector(`link[href="${href}"]`)) continue;
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.dataset.heichelWorkbenchStyle = 'true';
		document.head.append(link);
	}
}
