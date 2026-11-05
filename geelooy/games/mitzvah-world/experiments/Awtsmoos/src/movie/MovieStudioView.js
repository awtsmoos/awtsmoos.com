// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioView.js
 * @description Creates stable DOM references, document identity, and project-aware preview geometry for the studio shell.
 * The Awtsmoos renews each visible boundary beyond form; Awtsmoos.com gives portrait and landscape projects
 * one truthful aspect token so monitor, cinema focus, guides, and canvas all reveal the same authored vessel.
 */

import { movieStudioMarkup } from './MovieStudioMarkup.js';
import { installMovieStudioStyles } from './MovieStudioStyles.js';
import { collectMovieStudioViewReferences } from './MovieStudioViewReferences.js';
import { createMovieWorldLoadingView } from './MovieWorldLoadingView.js';

const LOADING_SELECTOR = '[data-movie-studio-loading]';

export function createMovieStudioView(project) {
	installMovieStudioStyles();
	const root = document.createElement('section');
	root.className = 'Awtsmoos-movie-studio';
	root.setAttribute('aria-label', 'MitzvahWorld Movie Maker');
	root.innerHTML = movieStudioMarkup(project);
	document.body.appendChild(root);
	const view = collectMovieStudioViewReferences(root);
	view.previousDocumentTitle = document.title;
	view.setProject = value => setMovieStudioViewProject(view, value);
	view.restoreDocumentTitle = () => {
		document.title = view.previousDocumentTitle;
	};
	view.setProject(project);
	return view;
}

export function showMovieLoading(message = 'B"H building the cinematic world…') {
	removeMovieLoadingOverlays();
	const loading = createMovieWorldLoadingView(message);
	return { ...loading, remove: removeMovieLoadingOverlays };
}

function removeMovieLoadingOverlays() {
	document.querySelectorAll(LOADING_SELECTOR).forEach(element => element.remove());
}

function setMovieStudioViewProject(view, project) {
	const width = Number(project.resolution?.width) || 1920;
	const height = Number(project.resolution?.height) || 1080;
	const aspect = width / height;
	view.root.style.setProperty('--movie-aspect-ratio', String(aspect));
	view.root.style.setProperty('--movie-project-aspect', String(aspect));
	view.root.style.setProperty('--movie-project-width', `${width}px`);
	view.root.style.setProperty('--movie-project-height', `${height}px`);
	view.root.dataset.projectOrientation = height > width ? 'portrait' : 'landscape';
	const title = project.title || 'Untitled movie';
	document.title = `MitzvahWorld Movie Maker — ${title}`;
	if (view.title) view.title.textContent = title;
	if (view.json) view.json.value = JSON.stringify(project, null, 2);
	setOptionalMovieText(view.root, 'project-meta', `${width}×${height} · ${project.duration.toFixed(2)}s`);
	setOptionalMovieText(view.root, 'resolution', `${width} × ${height}`);
	setOptionalMovieText(view.root, 'fps', `${project.fps} fps`);
	setOptionalMovieText(view.root, 'duration', `${project.duration.toFixed(2)} s`);
	setOptionalMovieText(view.root, 'track-count', String(project.tracks.length));
}

function setOptionalMovieText(root, name, value) {
	const element = root.querySelector(`[data-${name}]`);
	if (element) element.textContent = value;
}
