// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleApp
 * @description
 * Project state, catalog actions, AI exchange, generated assets, WebGL-ready canvas,
 * sound, timeline, history, recorder, and public API unite in one responsive studio.
 */

import { NleAiStudio } from './NleAiStudio.js';
import { NleAssetLab } from './NleAssetLab.js';
import { NleAssetRepository } from './NleAssetRepository.js';
import { NleAudioEngine } from './NleAudioEngine.js';
import { NleCompositor } from './NleCompositor.js';
import { installNleAppCommands } from './NleAppCommands.js';
import { bindNleAppEvents } from './NleAppEvents.js';
import { renderNleApp } from './NleAppRender.js';
import { NleInspector } from './NleInspector.js';
import { installNleKeyboard } from './NleKeyboard.js';
import { NleMovieActionExecutor } from './NleMovieActionExecutor.js';
import { createNleMovieActionApi } from './NleMovieActionApi.js';
import { NleMovieRecorder } from './NleMovieRecorder.js';
import { installNleMobileTabs } from './NleMobileTabs.js';
import { NlePlayback } from './NlePlayback.js';
import { NleProjectIO } from './NleProjectIO.js';
import { NleProjectState } from './NleProjectState.js';
import { publishNleMovieApi } from './NlePublicApi.js';
import { createNleShell } from './NleShell.js';
import { NleTimelineControls } from './NleTimelineControls.js';
import { installNleTimelineInteractions } from './NleTimelineInteractions.js';
import { NleTimelineView } from './NleTimelineView.js';
import { NleTransportView } from './NleTransportView.js';

export class NleApp {
	static async create(root = document) {
		const io = new NleProjectIO();
		return new NleApp({ io, project: await io.loadInitial(), root });
	}

	constructor({ io, project, root }) {
		this.io = io; this.root = root; this.view = createNleShell(root); this.state = new NleProjectState(project);
		this.repository = new NleAssetRepository(); this.audio = new NleAudioEngine();
		this.compositor = new NleCompositor(this.view.canvas, this.repository);
		this.playback = new NlePlayback({ audio: this.audio, compositor: this.compositor, state: this.state });
		this.recorder = new NleMovieRecorder({ audio: this.audio, compositor: this.compositor, state: this.state });
		this.timeline = new NleTimelineView({ root: this.view.timeline });
		this.timelineControls = new NleTimelineControls({ playback: this.playback, root: this.view.timelineControls, state: this.state });
		this.transport = new NleTransportView({ playback: this.playback, root: this.view.transport, state: this.state });
		this.assets = new NleAssetLab({ repository: this.repository, root: this.view.assets, state: this.state });
		this.inspector = new NleInspector({ root: this.view.inspector, state: this.state });
		this.actionExecutor = new NleMovieActionExecutor(this);
		this.actionApi = createNleMovieActionApi(this.actionExecutor);
		this.ai = new NleAiStudio({ actionExecutor: this.actionExecutor, dialog: this.view.aiDialog, io: this.io, notify: (message, error = false) => this.setStatus(message, error), state: this.state });
		this.assemble();
	}

	assemble() {
		installNleAppCommands(this); bindNleAppEvents(this);
		installNleTimelineInteractions({ root: this.view.timeline, state: this.state });
		installNleMobileTabs(this.root); installNleKeyboard(this);
		this.state.subscribe((snapshot, reason) => renderNleApp(this, snapshot, reason));
		renderNleApp(this, this.state.snapshot(), 'initial'); publishNleMovieApi(this);
		this.setStatus('Cinematic NLE ready · every Actions card has the same public API method.');
	}

	async renderAndDownload() {
		this.setStatus('Rendering movie locally…'); this.view.progress.value = 0;
		try {
			const result = await this.recorder.render({ onProgress: value => { this.view.progress.value = value.percent; this.setStatus(`Rendering ${value.percent.toFixed(1)}%`); } });
			this.io.downloadMovie(result); this.setStatus(`Movie ready · ${(result.bytes / 1048576).toFixed(2)} MiB`); return result;
		} catch (error) { this.setStatus(error.message, true); throw error; }
	}
	setStatus(message, error = false) { this.view.status.textContent = message; this.view.status.toggleAttribute('data-error', error); }
}
