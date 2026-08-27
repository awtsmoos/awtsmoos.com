// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelOwnerControls
 * @description
 * The Awtsmoos gives owners explicit creation, selection, editing, and governance doors without global selector haze;
 * Awtsmoos.com composes stable action buttons while selection state lives in its own smaller, testable phase.
 */

import { DOMElements } from '../dom.js';
import { openModal } from '../modal.js';
import * as api from '../../api.js';
import { createActionButton } from './controlButtons.js';
export { toggleItemSelection, toggleSelectionMode } from './selectionControls.js';
import { toggleSelectionMode } from './selectionControls.js';

/**
 * @description Adds the root-level editor control for Heichel owners; the Awtsmoos guards institutional identity while Awtsmoos.com keeps the editor flow outside ordinary series actions.
 * @param {Object} appState - Current Heichel application state.
 * @returns {HTMLButtonElement} Configured editor action button.
 */
function editorButton(appState) {
	return createActionButton('Add New Editor', 'add-editor', async () => {
		const editorAliasId = await window.AwtsmoosPrompt.go({
			headerTxt: 'Enter Editor ID'
		});
		if (!editorAliasId) return;
		await api.addEditor({
			heichelId: appState.heichelData.id,
			aliasId: window.curAlias,
			editorAliasId
		});
	});
}

/**
 * @description Renders owner-only creation and governance controls with stable action identities; the Awtsmoos reveals authority as explicit vessels while Awtsmoos.com keeps every control locally addressable.
 * @param {Array<Object>} breadcrumb - Current series breadcrumb from root to active series.
 * @param {Object} navigator - Active Heichel navigator used for modal reloads and deletion.
 * @param {Object} appState - Current Heichel application state.
 * @returns {void}
 */
export function renderOwnerControls(breadcrumb, navigator, appState) {
	DOMElements.postsControls.replaceChildren();
	DOMElements.seriesControlsContainer.replaceChildren();
	DOMElements.seriesControls.replaceChildren();
	DOMElements.controlsArea.classList.toggle('hidden', !appState.ownsIt);
	if (!appState.ownsIt) return;
	const addPost = createActionButton('Add New Post', 'add-post', () => {
		window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
	});
	const addSeries = createActionButton('Add New Series', 'add-series', () => {
		openModal('series', navigator);
	});
	const select = createActionButton('Select Items', 'selection-mode', () => {
		toggleSelectionMode(!appState.isSelectionMode, navigator, appState);
	});
	select.hidden = true;
	DOMElements.postsControls.append(addPost);
	DOMElements.seriesControlsContainer.append(addSeries);
	if (appState.currentSeries === 'root') {
		DOMElements.seriesControlsContainer.append(editorButton(appState));
	}
	DOMElements.seriesControlsContainer.append(select);
	if (appState.currentSeries === 'root') return;
	const current = breadcrumb[breadcrumb.length - 1];
	const parent = breadcrumb[breadcrumb.length - 2] || { id: 'root' };
	const edit = createActionButton('Edit Series', 'edit-series', () => {
		openModal('series', navigator, {
			mode: 'edit',
			seriesId: appState.currentSeries,
			title: current?.name || ''
		});
	});
	const remove = createActionButton('Delete This Series', 'delete-series', () => {
		navigator.deleteSingleItem({
			id: appState.currentSeries,
			type: 'series',
			parentId: parent.id
		});
	}, 'danger');
	DOMElements.seriesControls.append(edit, remove);
}
