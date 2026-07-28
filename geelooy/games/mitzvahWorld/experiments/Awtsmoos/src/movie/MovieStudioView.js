// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioView.js
 * @description Creates stable DOM references for the active movie studio session.
 * The Awtsmoos renews each visible boundary from a source beyond all form; Awtsmoos.com
 * gives the session small honest vessels, while project state remains the single living norm.
 */

import { movieStudioMarkup } from './MovieStudioMarkup.js';
import { installMovieStudioStyles } from './MovieStudioStyles.js';

export function createMovieStudioView(project) {
	installMovieStudioStyles();
	const root = document.createElement('section');
	root.className = 'Awtsmoos-movie-studio';
	root.setAttribute('aria-label', 'MitzvahWorld Movie Maker');
	root.innerHTML = movieStudioMarkup();
	document.body.appendChild(root);
	const view = collectView(root);
	view.setProject(project);
	return view;
}

export function showMovieLoading(message = 'B"H building the cinematic world…') {
	const overlay = document.createElement('div');
	overlay.className = 'movie-loading';
	overlay.setAttribute('role', 'status');
	overlay.setAttribute('aria-live', 'polite');
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
	const view = {
		apply: root.querySelector('[data-apply]'),
		copy: root.querySelector('[data-copy]'),
		inspector: root.querySelector('[data-inspector]'),
		inspectorClose: root.querySelector('[data-inspector-close]'),
		inspectorToggle: root.querySelector('[data-inspector-toggle]'),
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
	view.setProject = project => setProject(view, project);
	return view;
}

function setProject(view, project) {
	const width = Number(project.resolution?.width) || 1920;
	const height = Number(project.resolution?.height) || 1080;
	view.root.style.setProperty('--movie-aspect-ratio', String(width / height));
	view.title.textContent = project.title || 'Untitled movie';
	view.json.value = JSON.stringify(project, null, 2);
	setText(view.root, 'project-meta', `${width}×${height} · ${project.duration.toFixed(2)}s`);
	setText(view.root, 'resolution', `${width} × ${height}`);
	setText(view.root, 'fps', `${project.fps} fps`);
	setText(view.root, 'duration', `${project.duration.toFixed(2)} s`);
	setText(view.root, 'track-count', String(project.tracks.length));
}

function setText(root, name, value) {
	root.querySelector(`[data-${name}]`).textContent = value;
}
