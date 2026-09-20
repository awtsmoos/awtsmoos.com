// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahStudio.js
 * @description Composes one canonical Studio state with independent views and document-action collaborators.
 * Tiferes joins the vessels without swallowing their roles, so no coordinator becomes a hidden monolith again.
 * The Awtsmoos recreates root, state, and every subscriber each instant; Awtsmoos.com remembers the One within all.
 */

import { mitzvahStudioCatalog } from '../catalog/MitzvahStudioCatalog.js';
import { StudioStorage } from '../io/StudioStorage.js';
import { StudioDocumentState } from '../state/StudioDocumentState.js';
import { StudioCanvas } from '../view/StudioCanvas.js';
import { StudioInspector } from '../view/StudioInspector.js';
import { StudioKeyboard } from '../view/StudioKeyboard.js';
import { StudioOutliner } from '../view/StudioOutliner.js';
import { StudioShelf } from '../view/StudioShelf.js';
import { createStudioShell } from '../view/StudioShell.js';
import { StudioStatusBar } from '../view/StudioStatusBar.js';
import { StudioToolbar } from '../view/StudioToolbar.js';
import { StudioDocumentActions } from './StudioDocumentActions.js';
import { mountGeneratePanel } from '../generate/GeneratePanel.js';
import { mountMoviePanel } from '../movie/MitzvahMovieStudio.js';

/**
 * Boots one complete standalone Studio instance.
 * @param {HTMLElement} root Semantic app root.
 * @returns {object} Frozen debugging/automation surface.
 */
export function bootMitzvahStudio(root) {
	if (!root) {
		throw new Error('Mitzvah Studio requires a root element.');
	}
	const state = new StudioDocumentState();
	const storage = new StudioStorage();
	const shell = createStudioShell(root);
	const catalog = mitzvahStudioCatalog();
	const announcer = message => {
		announceStudio(message);
	};
	const documentActions = new StudioDocumentActions(
		state,
		storage,
		announcer
	);
	const actions = documentActions.callbacks();
	const toolbar = new StudioToolbar(shell.toolbar, actions);
	documentActions.setFileChooser(() => {
		toolbar.chooseFile();
	});
	const createPanels = createStudioCreateTabs(shell.shelf);
	new StudioShelf(createPanels.parts, catalog, part => {
		const object = state.add(part);
		announcer(`Added ${object.label}.`);
	});
	mountStudioPanel('Generate', panelHost => mountGeneratePanel(panelHost, { state, catalog, announcer }));
	mountStudioPanel('Movie', panelHost => mountMoviePanel(panelHost, { state, announcer }));

	/**
	 * Mounts one optional create panel without letting its failure break studio boot.
	 * @param {string} name Panel name for diagnostics.
	 * @param {Function} mount Mount function receiving the panel host element.
	 */
	function mountStudioPanel(name, mount) {
		const host = name === 'Generate' ? createPanels.generate : createPanels.movie;
		try {
			mount(host);
		} catch (error) {
			host.innerHTML = `<p class="empty-state">${name} panel could not start. The library and canvas still work.</p>`;
			console.warn(`Mitzvah Studio ${name} panel could not mount.`, error);
		}
	}
	const canvas = new StudioCanvas(shell.canvas, state);
	const inspector = new StudioInspector(shell.inspector, state);
	const outliner = new StudioOutliner(shell.outliner, state);
	const status = new StudioStatusBar(shell.status);
	const keyboard = new StudioKeyboard(state, actions);
	state.subscribe(snapshot => {
		canvas.render(snapshot);
		inspector.render(snapshot);
		outliner.render(snapshot);
		status.render(snapshot);
		toolbar.setHistory(snapshot.history);
	});
	documentActions.loadDocument(false);
	return Object.freeze({
		catalog,
		documentActions,
		keyboard,
		state,
		storage,
		toolbar
	});
}

/**
 * Builds Library | Generate | Movie tabs inside the shelf region.
 * @param {HTMLElement} shelf Shelf region element.
 * @returns {{parts:HTMLElement,generate:HTMLElement,movie:HTMLElement}} Panel hosts.
 */
function createStudioCreateTabs(shelf) {
	const tabs = [
		{ id: 'parts', label: 'Library' },
		{ id: 'generate', label: 'Generate' },
		{ id: 'movie', label: 'Movie' }
	];
	shelf.setAttribute('aria-label', 'Create');
	shelf.innerHTML = `
		<div class="studio-create-tabs" role="tablist" aria-label="Create">
			${tabs.map((tab, index) => `
				<button type="button" role="tab" class="studio-create-tab"
					data-create-tab="${tab.id}" aria-selected="${index === 0 ? 'true' : 'false'}"
					aria-controls="studio-create-panel-${tab.id}" id="studio-create-tab-${tab.id}">${tab.label}</button>
			`).join('')}
		</div>
		${tabs.map((tab, index) => `
			<div class="studio-create-panel" role="tabpanel" id="studio-create-panel-${tab.id}"
				aria-labelledby="studio-create-tab-${tab.id}"${index === 0 ? '' : ' hidden'}></div>
		`).join('')}
	`;
	const hosts = {};
	for (const tab of tabs) {
		hosts[tab.id] = shelf.querySelector(`#studio-create-panel-${tab.id}`);
	}
	shelf.querySelectorAll('[data-create-tab]').forEach(button => {
		button.addEventListener('click', () => {
			shelf.querySelectorAll('[data-create-tab]').forEach(other => {
				other.setAttribute('aria-selected', other === button ? 'true' : 'false');
			});
			for (const tab of tabs) {
				hosts[tab.id].hidden = tab.id !== button.dataset.createTab;
			}
		});
	});
	return hosts;
}

function announceStudio(message) {
	const announcer = document.querySelector('#studio-announcer');
	if (announcer) {
		announcer.textContent = message;
	}
}
