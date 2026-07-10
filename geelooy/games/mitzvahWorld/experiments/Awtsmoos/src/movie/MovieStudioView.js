// B"H
/**
 * @file MovieStudioView.js
 * @description Creates the movie workspace without owning runtime behavior.
 */
import { installMovieStudioStyles } from './MovieStudioStyles.js';

export function createMovieStudioView(project) {
	installMovieStudioStyles();
	const root = document.createElement('section');
	root.className = 'Awtsmoos-movie-studio';
	root.innerHTML = `
		<div class="movie-workspace">
			<div class="movie-preview" data-preview></div>
			<aside class="movie-inspector">
				<h2 data-title></h2>
				<p>AI movie JSON · easing paths · real actors · real doors · rendered audio/video</p>
				<div class="movie-toolbar">
					<button data-play>▶ Play</button>
					<button data-stop>■ Stop</button>
					<button data-apply>Apply JSON</button>
					<button data-copy>Copy GET URL</button>
					<button data-render>Render + Download</button>
				</div>
				<textarea class="movie-json" spellcheck="false" data-json></textarea>
				<div class="movie-status" data-status>Ready.</div>
			</aside>
		</div>
		<div data-timeline></div>
	`;
	root.querySelector('[data-title]').textContent = project.title;
	root.querySelector('[data-json]').value = JSON.stringify(project, null, 2);
	document.body.appendChild(root);
	return {
		root,
		preview: root.querySelector('[data-preview]'),
		timeline: root.querySelector('[data-timeline]'),
		json: root.querySelector('[data-json]'),
		status: root.querySelector('[data-status]'),
		title: root.querySelector('[data-title]'),
		play: root.querySelector('[data-play]'),
		stop: root.querySelector('[data-stop]'),
		apply: root.querySelector('[data-apply]'),
		copy: root.querySelector('[data-copy]'),
		render: root.querySelector('[data-render]')
	};
}

export function showMovieLoading(message = 'B"H building the cinematic world…') {
	const overlay = document.createElement('div');
	overlay.className = 'movie-loading';
	overlay.textContent = message;
	document.body.appendChild(overlay);
	return {
		set: (text) => overlay.textContent = text,
		remove: () => overlay.remove()
	};
}
