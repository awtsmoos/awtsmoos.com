// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSession.js
 * @description Owns canonical project installation, preview state, timeline edits, and capture.
 * The Awtsmoos renews every cut beyond editor state; Awtsmoos.com recompiles one source
 * so JSON, project facts, preview, transforms, timeline, and final capture cannot drift.
 */

import { MovieDirector } from './MovieDirector.js';
import {
	normalizeMovieProject,
	validateMovieProject
} from './MovieProject.js';
import { MovieRecorder } from './MovieRecorder.js';
import {
	copyMovieStudioUrl,
	publishMovieStudioSession,
	renderMovieStudioSession
} from './MovieStudioSessionActions.js';
import { MovieTimelineView } from './MovieTimelineView.js';
import { MovieTransformInspector } from './MovieTransformInspector.js';

export class MovieStudioSession {
	constructor(runtime, diagnostics, view, source) {
		this.runtime = runtime;
		this.diagnostics = diagnostics;
		this.view = view;
		this.time = 0;
		this.inspector = new MovieTransformInspector(
			view.transform,
			() => this.installProject(this.project, { preserveTime: true })
		);
		this.installProject(source);
	}

	installProject(source, options = {}) {
		const previousTime = options.preserveTime ? this.time : 0;
		this.project = validProject(source);
		this.timeline?.destroy();
		this.director?.destroy();
		this.director = new MovieDirector(this.runtime, this.project);
		this.recorder = new MovieRecorder(this.director);
		this.view.preview.replaceChildren(this.director.overlay.canvas);
		this.view.setProject(this.project);
		this.timeline = new MovieTimelineView(
			this.project,
			this.view.timeline,
			time => this.seek(time),
			{
				onChange: value => this.onTimelineChange(value),
				onSelect: value => this.inspector.select(value)
			}
		);
		this.seek(Math.min(previousTime, this.project.duration));
		publishMovieStudioSession(this);
		return this.project;
	}

	onTimelineChange(value) {
		this.view.setProject(this.project);
		if (!value.transient) {
			this.installProject(this.project, { preserveTime: true });
		}
	}

	seek(time) {
		this.time = Math.max(0, Math.min(
			this.project.duration,
			Number(time) || 0
		));
		const frame = this.director.seek(this.time);
		this.timeline?.setTime(frame.time);
		this.view.status.textContent = `${frame.time.toFixed(2)} / ${
			this.project.duration.toFixed(2)
		}s · ${frame.shot}`;
		return frame;
	}

	play() {
		this.director.play({
			onEnd: () => {
				this.view.status.textContent = 'Preview complete.';
			},
			onFrame: frame => {
				this.time = frame.time;
				this.timeline.setTime(frame.time);
				this.view.status.textContent = `Preview ${
					frame.time.toFixed(2)
				} / ${this.project.duration.toFixed(2)}s`;
			}
		});
	}

	render() {
		return renderMovieStudioSession(this);
	}

	copyUrl() {
		return copyMovieStudioUrl(this);
	}
}

function validProject(source) {
	const project = normalizeMovieProject(source);
	validateMovieProject(project);
	return project;
}
