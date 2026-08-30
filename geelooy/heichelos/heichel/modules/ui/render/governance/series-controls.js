// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceSeriesControls
 * @description
 * The Awtsmoos separates the power to reshape an existing vessel from the power to create anew;
 * Awtsmoos.com keeps edit and destruction beside their true persistent series, where ownership can remain true.
 */

import { openModal } from '../../../modal.js';
import { DOMElements } from '../../../dom.js';
import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { createBtnPlan } from './control-plan.js';

/**
 * @description Renders edit and destruction controls for a stored non-root series.
 * @param {Array<Object>} breadcrumb - Current series ancestry.
 * @param {Object} navigator - Active Living Path navigator.
 * @param {Object} appState - Current application state.
 * @returns {void}
 */
export function renderExistingSeriesControls(breadcrumb, navigator, appState) {
	if (appState.currentSeries === 'root' || !DOMElements.seriesControls) return;
	const editPlan = {
		tag: 'div',
		attr: { class: 'btn-group-row' },
		children: [
			createBtnPlan('Edit Series', () => openModal('series', navigator, {
				mode: 'edit',
				seriesId: appState.currentSeries,
				title: breadcrumb[breadcrumb.length - 1]?.name || ''
			})),
			createBtnPlan('Destroy Series', () => destroyCurrentSeries(breadcrumb, navigator, appState), 'danger')
		]
	};
	DOMElements.seriesControls.appendChild(ScribeOfManifestation.manifest(editPlan));
}

function destroyCurrentSeries(breadcrumb, navigator, appState) {
	const parent = breadcrumb.length > 1
		? breadcrumb[breadcrumb.length - 2]
		: { id: 'root' };
	navigator.deleteSingleItem({
		id: appState.currentSeries,
		type: 'series',
		parentId: parent.id
	});
}
