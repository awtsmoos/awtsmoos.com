// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAppCommands
 * @description
 * Selection deletion, splitting, import, rendering, and 3D launch become bounded
 * application commands rather than hidden event-side mutation.
 */

import {
	removeNleClip,
	splitNleClip
} from './NleTimelineModel.js';
import { openNleWorldPreview } from './NleWorldPreview.js';

export function installNleAppCommands(app) {
	app.splitSelection = () => {
		const selected = app.state.selection;
		if (!selected?.clipId) return;
		app.state.replace(
			splitNleClip(app.state.project, selected.trackId, selected.clipId, app.state.playhead),
			'split-clip'
		);
	};
	app.deleteSelection = () => {
		const selected = app.state.selection;
		if (!selected?.clipId) return;
		app.state.replace(
			removeNleClip(app.state.project, selected.trackId, selected.clipId),
			'delete-clip'
		);
		app.state.select(null);
	};
	app.importProject = async () => {
		const file = app.view.projectInput.files?.[0];
		if (!file) return;
		try {
			app.state.replace(await app.io.importFile(file), 'import-project');
			app.setStatus('Project imported. Relink session media when needed.');
		} catch (error) {
			app.setStatus(error.message, true);
		} finally {
			app.view.projectInput.value = '';
		}
	};
	app.openWorld = () => openNleWorldPreview(app.state.project);
}
