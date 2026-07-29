// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldLoadingView.js
 * @description Creates an accessible progress overlay with legacy text, state updates, retry, and cancel actions.
 * The Awtsmoos renews every stage before text, percentage, retry, and cancel can divide;
 * Awtsmoos.com binds accessible state to one localized surface where honest progress may abide.
 */

import { movieWorldLoadingMarkup } from './MovieWorldLoadingMarkup.js';

export function createMovieWorldLoadingView(message) {
	const template = document.createElement('template');
	template.innerHTML = movieWorldLoadingMarkup().trim();
	const root = template.content.firstElementChild;
	root.dataset.movieStudioLoading = '';
	const references = collect(root);
	if (message) references.title.textContent = String(message);
	document.body.appendChild(root);
	return {
		element: root,
		onCancel: listener => bind(references.cancel, listener),
		onRetry: listener => bind(references.retry, listener),
		remove: () => root.remove(),
		set: text => setLegacyText(references, text),
		update: state => updateMovieWorldLoadingView(references, state)
	};
}

export function updateMovieWorldLoadingView(view, state = {}) {
	const status = String(state.status || 'loading');
	const progress = boundedProgress(state.progress);
	view.root.dataset.state = status;
	view.root.setAttribute('aria-busy', status === 'ready' ? 'false' : 'true');
	view.stage.textContent = String(state.label || state.current || 'Preparing project');
	view.details.textContent = String(state.details || statusMessage(status));
	view.progress.parentElement.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
	view.progress.style.setProperty('--movie-loading-progress', `${progress * 100}%`);
	view.retry.hidden = status !== 'error' && status !== 'fallback';
	view.cancel.hidden = status === 'ready';
}

function collect(root) {
	return {
		cancel: root.querySelector('[data-loading-cancel]'),
		details: root.querySelector('[data-loading-details]'),
		progress: root.querySelector('[data-loading-progress]'),
		retry: root.querySelector('[data-loading-retry]'),
		root,
		stage: root.querySelector('[data-loading-stage]'),
		title: root.querySelector('[data-loading-title]')
	};
}

function bind(element, listener) {
	element.addEventListener('click', listener);
	return () => element.removeEventListener('click', listener);
}

function setLegacyText(view, text) {
	if (view.root.isConnected) view.stage.textContent = String(text);
}

function boundedProgress(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 0;
	return Math.max(0, Math.min(1, number));
}

function statusMessage(status) {
	if (status === 'error') return 'The world could not be loaded. Retry or cancel.';
	if (status === 'fallback') return 'Loading a compatible fallback world.';
	if (status === 'ready') return 'The cinematic world is ready.';
	if (status === 'cancelled') return 'World loading was cancelled.';
	return 'Loading terrain, actors, cameras, light, and sound.';
}
