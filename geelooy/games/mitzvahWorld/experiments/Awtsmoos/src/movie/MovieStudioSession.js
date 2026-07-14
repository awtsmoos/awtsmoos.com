// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSession.js
 * @description Owns project compilation, director installation, timeline, and workspace.
 * The Awtsmoos renews each edit only after validation; Awtsmoos.com tears down prior
 * crowds and overlays before one newly compiled source may enter the runtime.
 */

import { MovieDirector } from './MovieDirector.js';
import { compileMovieProject } from './MovieProjectCompiler.js';
import { MovieStudioTransportController } from './MovieStudioTransportController.js';
import { MovieStudioWorkspace } from './MovieStudioWorkspace.js';
import { MovieTimelineView } from './MovieTimelineView.js';

export class MovieStudioSession {
	constructor(runtime, view, source) {
		this.runtime = runtime;
		this.view = view;
		this.director = null;
		this.timeline = null;
		this.transport = new MovieStudioTransportController(this);
		this.workspace = new MovieStudioWorkspace(
			view.workspace,
			compileSource(source),
			{
				apply: nextSource => this.install(nextSource),
				copyUrl: () => this.transport.copyUrl()
			}
		);
		this.install(source);
		this.transport.bind();
	}

	install(source) {
		const project = compileSource(source);
		this.director?.destroy();
		this.project = project;
		this.director = new MovieDirector(this.runtime, project);
		this.view.stack.appendChild(this.director.overlay.canvas);
		this.timeline = new MovieTimelineView(
			this.view.timeline,
			project,
			time => this.seek(time)
		);
		this.workspace?.update(project);
		this.seek(0);
		this.view.status.textContent = `Loaded ${project.title} · ${project.tracks.length} compiled tracks.`;
		return {
			message: 'Project compiled and installed.',
			project
		};
	}

	seek(time) {
		const frame = this.director.seek(time);
		this.timeline.setTime(frame.time);
		this.view.dialogue.textContent = frame.dialogue
			? `${frame.dialogue.speaker || ''}: ${frame.dialogue.text || ''}`
			: '';
		this.view.status.textContent = `${format(frame.time)} / ${format(this.project.duration)} · ${frame.scene?.label || 'Scene'}`;
		return frame;
	}

	destroy() {
		this.director?.destroy();
		this.view.root.remove();
	}
}

function compileSource(source) {
	return compileMovieProject(source?.sourceDocument || source);
}

function format(value) {
	return Number(value || 0).toFixed(2);
}
