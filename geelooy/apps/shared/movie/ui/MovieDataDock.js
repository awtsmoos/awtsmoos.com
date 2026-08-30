//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDataDock.js
 * @description The Awtsmoos gives exact data one mobile doorway into boards, time, canvas, and export;
 * Awtsmoos.com keeps authorship outside the renderer while old and new shell names share one styled port.
 */
import { installMovieAgentBridge } from '../agent/MovieAgentBridge.js';
import { MalchusMovieDataState } from './MovieDataState.js';
import { mountMovieCanvasPanel } from './MovieCanvasPanel.js';
import { mountMovieDataPanel } from './MovieDataPanel.js';
import { mountMovieExportPanel } from './MovieExportPanel.js';
import { mountMoviePatchPanel } from './MoviePatchPanel.js';
import { mountMovieStoryboardPanel } from './MovieStoryboardPanel.js';
import { mountMovieTimelinePanel } from './MovieTimelinePanel.js';

const PANELS = ['data', 'storyboard', 'timeline', 'canvas', 'export'];

export function mountMovieDataDock(options = {}) {
	const appId = options.appId || 'shared';
	const appName = options.appName || 'Movie';
	const root = document.createElement('section');
	root.className = 'awtsmoos-movie-director movie-director-shell';
	root.dataset.awtsmoosMovieDirector = appId;
	root.innerHTML = markup(appName);
	document.body.append(root);
	const statusNode = root.querySelector('[data-movie-status]');
	const status = message => { statusNode.textContent = message; };
	const state = new MalchusMovieDataState({ projector: options.projector || null });
	mountMovieDataPanel(root.querySelector('[data-movie-data-host]'), state, status);
	mountMoviePatchPanel(root.querySelector('[data-movie-patch-host]'), state, status);
	mountMovieStoryboardPanel(root.querySelector('[data-panel="storyboard"]'), state);
	mountMovieTimelinePanel(root.querySelector('[data-panel="timeline"]'), state);
	mountMovieCanvasPanel(root.querySelector('[data-panel="canvas"]'), state);
	mountMovieExportPanel(root.querySelector('[data-panel="export"]'), state, options, status);
	const bridge = installMovieAgentBridge({ root, state, appId, appName });
	bindTabs(root);
	bindCollapse(root);
	showPanel(root, 'data');
	if (options.initialMovie) state.load(options.initialMovie);
	return { root, state, bridge };
}

function bindTabs(root) {
	root.querySelectorAll('[data-movie-tab]').forEach(button => {
		button.addEventListener('click', () => showPanel(root, button.dataset.movieTab));
	});
}

function bindCollapse(root) {
	root.querySelector('[data-movie-collapse]').addEventListener('click', event => {
		const collapsed = root.classList.toggle('is-collapsed');
		event.currentTarget.textContent = collapsed ? 'Show' : 'Hide';
	});
}

function showPanel(root, name) {
	root.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
	root.querySelectorAll('[data-movie-tab]').forEach(tab => { tab.setAttribute('aria-selected', String(tab.dataset.movieTab === name)); });
}

function markup(appName) {
	const tabs = PANELS.map(name => `<button type="button" role="tab" data-movie-tab="${name}">${label(name)}</button>`).join('');
	return `<header class="movie-director-header"><div><strong>Movie Data Studio</strong><small>${escapeHtml(appName)}</small></div><button type="button" data-movie-collapse>Hide</button></header><div class="movie-director-body"><nav class="movie-director-tabs" role="tablist">${tabs}</nav><main class="movie-director-panels"><section data-panel="data"><div data-movie-data-host></div><div data-movie-patch-host></div></section><section data-panel="storyboard"></section><section data-panel="timeline"></section><section data-panel="canvas"></section><section data-panel="export"></section></main><output class="movie-director-status" data-movie-status aria-live="polite">Ready for canonical movie data.</output></div>`;
}

function label(name) {
	return ({ data: 'Data', storyboard: 'Boards', timeline: 'Timeline', canvas: 'Canvas', export: 'Export' })[name];
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
