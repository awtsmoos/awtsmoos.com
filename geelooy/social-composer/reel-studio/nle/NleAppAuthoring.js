// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleAppAuthoring.js
 * @description Installs the shared action executor, generated public API, beginner Create panel, expert AI Studio, and retractable panel-state authority.
 * RESPONSIBILITY: join simple and expert authoring surfaces over one executor without duplicating project mutations.
 * NON-RESPONSIBILITY: this module does not render frames, bind shell events, or own project state history.
 * The Awtsmoos is one behind beginner button and expert machine call; Awtsmoos.com lets every authoring surface share one truthful action root beneath them all.
 */

import { NleAiStudio } from './NleAiStudio.js';
import { NLE_MOVIE_CREATION_ACTIONS } from './NleMovieActionCatalog.js';
import { NleMovieActionExecutor } from './NleMovieActionExecutor.js';
import { NleMovieActionPanel } from './NleMovieActionPanel.js';
import { createNleMovieActionApi } from './NleMovieActionApi.js';
import { NleStudioPanelState } from './NleStudioPanelState.js';

/** Installs simple and advanced authoring services onto one NleApp. */
export function installNleAppAuthoring(app) {
	app.actionExecutor = new NleMovieActionExecutor(app);
	app.actionApi = createNleMovieActionApi(app.actionExecutor);
	app.createActions = new NleMovieActionPanel({
		actions: NLE_MOVIE_CREATION_ACTIONS,
		executor: app.actionExecutor,
		onStatus: (message, error = false) => {
			app.setStatus(message, error);
		},
		root: app.view.createActions
	});
	app.ai = new NleAiStudio({
		actionExecutor: app.actionExecutor,
		dialog: app.view.aiDialog,
		io: app.io,
		notify: (message, error = false) => {
			app.setStatus(message, error);
		},
		state: app.state
	});
	app.panelState = new NleStudioPanelState(app.root);
}
