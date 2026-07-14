// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioView.js
 * @description Creates preview, structured inspector, exports, JSON, and timeline.
 * The Awtsmoos renews every cinematic vessel beyond layout; Awtsmoos.com gives
 * real-time and exact exports distinct controls so their timing promises stay honest.
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
				<header><h2 data-title></h2><p>Browser-native NLE · real world runtime</p></header>
				<div class="movie-toolbar">
					<button data-play>▶ Play</button>
					<button data-stop>■ Stop</button>
					<button data-apply>Apply JSON</button>
					<button data-copy>Copy URL</button>
					<button data-render>Render Live MP4</button>
					<button data-render-exact>Render Exact IVF</button>
				</div>
				<div class="movie-transform-inspector" data-transform></div>
				<details class="movie-json-disclosure">
					<summary>Project JSON</summary>
					<textarea class="movie-json" spellcheck="false" data-json></textarea>
				</details>
				<div class="movie-status" data-status>Ready.</div>
			</aside>
		</div>
		<div data-timeline></div>
	`;
	root.querySelector('[data-title]').textContent = project.title;
	root.querySelector('[data-json]').value = JSON.stringify(project, null, 2);
	document.body.appendChild(root);
	return collectView(root);
}

export function showMovieLoading(message = 'B"H building the cinematic world…') {
	const overlay = document.createElement('div');
	overlay.className = 'movie-loading';
	overlay.textContent = message;
	document.body.appendChild(overlay);
	return {
		remove: () => overlay.remove(),
		set: text => {
			overlay.textContent = text;
		}
	};
}

function collectView(root) {
	return {
		apply: root.querySelector('[data-apply]'),
		copy: root.querySelector('[data-copy]'),
		json: root.querySelector('[data-json]'),
		play: root.querySelector('[data-play]'),
		preview: root.querySelector('[data-preview]'),
		render: root.querySelector('[data-render]'),
		renderExact: root.querySelector('[data-render-exact]'),
		root,
		status: root.querySelector('[data-status]'),
		stop: root.querySelector('[data-stop]'),
		timeline: root.querySelector('[data-timeline]'),
		title: root.querySelector('[data-title]'),
		transform: root.querySelector('[data-transform]')
	};
}
