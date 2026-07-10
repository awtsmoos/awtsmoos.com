// B"H
/**
 * @file MovieStudio.js
 * @description Boots the real Eretz runtime beneath a JSON-driven NLE and exporter.
 */
import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { MovieDirector } from './MovieDirector.js';
import { normalizeMovieProject, validateMovieProject, encodeMovieProject } from './MovieProject.js';
import { MovieRecorder } from './MovieRecorder.js';
import { createMovieStudioView, showMovieLoading } from './MovieStudioView.js';
import { MovieTimelineView } from './MovieTimelineView.js';

function hideWorldChrome(hosts, canvas) {
	for (const host of Object.values(hosts || {})) {
		if (!host?.style || host === canvas) continue;
		host.style.display = 'none';
	}
	canvas.style.opacity = '0';
	canvas.style.pointerEvents = 'none';
}

function validProject(source) {
	const project = normalizeMovieProject(source);
	const validation = validateMovieProject(project);
	if (!validation.ok) throw new Error(validation.issues.join('\n'));
	return project;
}

export async function createMovieStudio(hosts, initialProject, options = {}) {
	const loading = showMovieLoading();
	const diagnostics = await createEretzRuntime(hosts, { startLoop: false });
	const runtime = diagnostics.runtime;
	hideWorldChrome(hosts, runtime.renderer.canvas);
	loading.set('B"H arranging timeline tracks and cameras…');
	let project = validProject(initialProject);
	const view = createMovieStudioView(project);
	let director;
	let recorder;
	let timeline;

	function seek(time) {
		const frame = director.seek(time);
		timeline?.setTime(frame.time);
		view.status.textContent = `${frame.time.toFixed(2)} / ${project.duration.toFixed(2)}s · ${frame.shot}`;
		return frame;
	}
	function publish() {
		window.AwtsmoosMovie = {
			ready: true, runtime, diagnostics, project, director, recorder, view,
			seek, play, render, copyUrl,
			applyJson: (text) => installProject(JSON.parse(text))
		};
	}
	function installProject(nextProject) {
		project = validProject(nextProject);
		director?.destroy();
		director = new MovieDirector(runtime, project);
		recorder = new MovieRecorder(director);
		view.preview.innerHTML = '';
		view.preview.appendChild(director.overlay.canvas);
		view.title.textContent = project.title;
		view.json.value = JSON.stringify(project, null, 2);
		timeline = new MovieTimelineView(project, view.timeline, seek);
		seek(0);
		publish();
	}
	function play() {
		director.play({
			onFrame: (frame) => {
				timeline.setTime(frame.time);
				view.status.textContent = `Preview ${frame.time.toFixed(2)} / ${project.duration.toFixed(2)}s`;
			},
			onEnd: () => view.status.textContent = 'Preview complete.'
		});
	}
	async function render() {
		view.render.disabled = true;
		view.status.textContent = 'Arming ordered video and audio capture…';
		try {
			const result = await recorder.render({
				download: true,
				onProgress: ({ time, percent }) => {
					timeline.setTime(time);
					view.status.textContent = `Rendering ${percent.toFixed(1)}% · ${time.toFixed(2)}s`;
				}
			});
			view.status.textContent = `Downloaded ${result.fileName} · ${(result.bytes / 1048576).toFixed(2)} MiB`;
			window.AwtsmoosMovieRenderComplete = result;
			return result;
		} catch (error) {
			view.status.textContent = `Render failed: ${error.message}`;
			window.AwtsmoosMovieRenderError = error?.stack || String(error);
			throw error;
		} finally {
			view.render.disabled = false;
		}
	}
	function copyUrl() {
		const url = new URL(location.href);
		url.search = '';
		url.searchParams.set('mode', 'movie');
		url.searchParams.set('movie', encodeMovieProject(project));
		navigator.clipboard?.writeText(url.href);
		view.status.textContent = `GET URL ready · ${url.href.length} characters`;
		return url.href;
	}

	view.play.addEventListener('click', play);
	view.stop.addEventListener('click', () => director.pause());
	view.apply.addEventListener('click', () => installProject(JSON.parse(view.json.value)));
	view.copy.addEventListener('click', copyUrl);
	view.render.addEventListener('click', render);
	installProject(project);
	loading.remove();
	if (options.autoRender) setTimeout(() => render(), 250);
	return window.AwtsmoosMovie;
}

export default createMovieStudio;
