// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobilePanelRenderer.js
 * @description Builds specialized mobile panels and skips unchanged DOM replacement.
 *
 * A panel is a vessel for choice, not a storm rebuilt without cause. The Awtsmoos
 * renews all form each instant; this renderer changes the browser vessel only when
 * its revealed meaning changes on Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { escapeHtml, rowHtml } from './MobileUiHelpers.js';
import { craftPanelHtml } from './panels/MobileCraftView.js';
import { panelData } from './panels/MobilePanelData.js';
import { partyPanelHtml } from './panels/MobilePartyView.js';
import { shopPanelHtml } from './panels/MobileShopView.js';

const genericPanelHtml = panel => `<article class="ohr-panel">
	<button data-close-panel aria-label="Close panel">×</button>
	<h2>${escapeHtml(panel.title)}</h2>
	<div>${escapeHtml(panel.intro)}</div>
	<section>${panel.rows.map(([label, value]) => rowHtml(label, value)).join('')}</section>
</article>`;

export function mobilePanelHtml() {
	if (State.UiPanel === 'shop') return shopPanelHtml();
	if (State.UiPanel === 'craft') return craftPanelHtml();
	if (State.UiPanel === 'party') return partyPanelHtml();
	const panel = State.UiPanel && panelData(State.UiPanel);
	return panel ? genericPanelHtml(panel) : '';
}

export function renderMobilePanel(shell) {
	if (!shell) return false;
	const html = mobilePanelHtml();
	const open = State.UiPanel ? 'true' : 'false';
	const changed = shell.__ohrPanelHtml !== html;
	if (changed) {
		shell.innerHTML = html;
		shell.__ohrPanelHtml = html;
	}
	if (shell.dataset.open !== open) shell.dataset.open = open;
	return changed;
}
