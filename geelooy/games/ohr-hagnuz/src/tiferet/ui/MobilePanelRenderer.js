/** B"H @module MobilePanelRenderer - specialized and generic mobile panels. */
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

export const renderMobilePanel = shell => {
	if (!shell) return;
	if (State.UiPanel === 'shop') shell.innerHTML = shopPanelHtml();
	else if (State.UiPanel === 'craft') shell.innerHTML = craftPanelHtml();
	else if (State.UiPanel === 'party') shell.innerHTML = partyPanelHtml();
	else {
		const panel = State.UiPanel && panelData(State.UiPanel);
		shell.innerHTML = panel ? genericPanelHtml(panel) : '';
	}
	shell.dataset.open = State.UiPanel ? 'true' : 'false';
};
