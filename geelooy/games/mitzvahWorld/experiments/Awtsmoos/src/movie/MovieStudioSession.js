// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSession.js
 * @description Owns project compilation, timeline edits, transform edits, preview, and render.
 * The Awtsmoos renews every cut beyond editor state; Awtsmoos.com recompiles one source
 * document so JSON, timeline, transform inspector, preview, and final capture cannot drift.
 */

import { MovieDirector } from './MovieDirector.js';
import {
	encodeMovieProject,
	normalizeMovieProject,
	validateMovieProject
} from './MovieProject.js';
import { MovieRecorder } from './MovieRecorder.js';
import { MovieTimelineView } from './MovieTimelineView.js';
import { MovieTransformInspector } from './MovieTransformInspector.js';

export class MovieStudioSession {
	constructor(runtime, view, source) {
		this.runtime = runtime;
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
		this.view.title.textContent = this.project.title;
		this.view.json.value = JSON.stringify(this.project, null, 2);
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
		this.publish();
		return this.project;
	}

	onTimelineChange(value) {
		this.view.json.value = JSON.stringify(this.project, null, 2);
		if (!value.transient) {
			this.installProject(this.project, { preserveTime: true });
		}
	}

	seek(time) {
		this.time = Math.max(0, Math.min(this.project.duration, Number(time) || 0));
		const frame = this.director.seek(this.time);
		this.timeline?.setTime(frame.time);
		this.view.status.textContent = `${frame.time.toFixed(2)} / ${this.project.duration.toFixed(2)}s · ${frame.shot}`;
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
				this.view.status.textContent = `Preview ${frame.time.toFixed(2)} / ${this.project.duration.toFixed(2)}s`;
			}
		});
	}

	async render() {
		this.view.render.disabled = true;
		this.view.status.textContent = 'Arming browser-native movie capture…';
		try {
			const result = await this.recorder.render({
				download: true,
				onProgress: progress => this.onRenderProgress(progress)
			});
			this.view.status.textContent = `Downloaded ${result.fileName} · ${(result.bytes / 1048576).toFixed(2)} MiB`;
			window.AwtsmoosMovieRenderComplete = result;
			return result;
		} catch (error) {
			this.view.status.textContent = `Render failed: ${error.message}`;
			window.AwtsmoosMovieRenderError = error?.stack || String(error);
			throw error;
		} finally {
			this.view.render.disabled = false;
		}
	}

	onRenderProgress({ time, percent }) {
		this.time = time;
		this.timeline.setTime(time);
		this.view.status.textContent = `Rendering ${percent.toFixed(1)}% · ${time.toFixed(2)}s`;
	}

	copyUrl() {
		const url = new URL(location.href);
		url.search = '';
		url.searchParams.set('mode', 'movie');
		url.searchParams.set('movie', encodeMovieProject(this.project));
		navigator.clipboard?.writeText(url.href);
		this.view.status.textContent = `GET URL ready · ${url.href.length} characters`;
		return url.href;
	}

	publish() {
		window.AwtsmoosMovie = {
			applyJson: text => this.installProject(JSON.parse(text)),
			copyUrl: () => this.copyUrl(),
			diagnostics: this.runtime.diagnostics,
			director: this.director,
			play: () => this.play(),
			project: this.project,
			ready: true,
			recorder: this.recorder,
			render: () => this.render(),
			runtime: this.runtime,
			seek: time => this.seek(time),
			view: this.view
		};
	}
}

function validProject(source) {
	const project = normalizeMovieProject(source);
	const validation = validateMovieProject(project);
	if (!validation.ok) throw new Error(validation.issues.join('\n'));
	return project;
}
