// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleApp.js
 * @description Coordinates one canvas-first Movie Studio lifecycle while focused workspace, authoring, command, event, rendering, and keyboard modules carry their own responsibilities.
 * RESPONSIBILITY: create initial state/shell, install service groups, subscribe rendering, publish the API, and own render/status orchestration.
 * NON-RESPONSIBILITY: this class no longer crams every editor constructor, panel behavior, or action implementation into one lifecycle file.
 * The Awtsmoos gathers every finite Studio service without becoming any one of them; Awtsmoos.com keeps the central app small so creation may feel effortless while deep systems still run.
 */

import { installNleAppAuthoring } from './NleAppAuthoring.js';
import { installNleAppCommands } from './NleAppCommands.js';
import { bindNleAppEvents } from './NleAppEvents.js';
import { renderNleApp } from './NleAppRender.js';
import { installNleAppWorkspace } from './NleAppWorkspace.js';
import { installNleKeyboard } from './NleKeyboard.js';
import { NleProjectIO } from './NleProjectIO.js';
import { NleProjectState } from './NleProjectState.js';
import { publishNleMovieApi } from './NlePublicApi.js';
import { createNleShell } from './NleShell.js';
import { bindNleStudioPanelEvents } from './NleStudioPanelEvents.js';
import { installNleTimelineInteractions } from './NleTimelineInteractions.js';

export class NleApp {
	static async create(root = document) {
		const io = new NleProjectIO();
		const project = await io.loadInitial();
		return new NleApp({
			io,
			project,
			root
		});
	}

	constructor({ io, project, root }) {
		this.io = io;
		this.root = root;
		this.view = createNleShell(root);
		this.state = new NleProjectState(project);
		installNleAppWorkspace(this);
		installNleAppAuthoring(this);
		this.assemble();
	}

	/** Connects application commands, surface events, timeline editing, shortcuts, rendering, and public API. */
	assemble() {
		installNleAppCommands(this);
		bindNleAppEvents(this);
		bindNleStudioPanelEvents(this);
		installNleTimelineInteractions({
			root: this.view.timeline,
			state: this.state
		});
		installNleKeyboard(this);
		this.state.subscribe((snapshot, reason) => {
			renderNleApp(this, snapshot, reason);
		});
		renderNleApp(this, this.state.snapshot(), 'initial');
		publishNleMovieApi(this);
		this.setStatus('Studio ready · Create → Shot → Play → Render.');
	}

	/** Renders the complete movie locally and downloads the verified recording. */
	async renderAndDownload() {
		this.setStatus('Rendering movie locally…');
		this.view.progress.value = 0;
		try {
			const result = await this.recorder.render({
				onProgress: value => {
					this.view.progress.value = value.percent;
					this.setStatus(`Rendering ${value.percent.toFixed(1)}%`);
				}
			});
			this.io.downloadMovie(result);
			this.setStatus(`Movie ready · ${(result.bytes / 1048576).toFixed(2)} MiB`);
			return result;
		} catch (error) {
			this.setStatus(error.message, true);
			throw error;
		}
	}

	/** Publishes calm user-visible operational status without changing project data. */
	setStatus(message, error = false) {
		this.view.status.textContent = message;
		this.view.status.toggleAttribute('data-error', error);
	}
}
