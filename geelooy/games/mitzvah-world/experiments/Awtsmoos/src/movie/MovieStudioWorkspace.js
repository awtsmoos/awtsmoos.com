// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioWorkspace.js
 * @description Hosts synchronized timeline, sequence, rig, graph, cast, material, and JSON tabs.
 * The Awtsmoos renews one source document through many readable windows;
 * Awtsmoos.com keeps rendering and interaction separate while every edit recompiles.
 */

import { createMovieWorkspaceModel } from './MovieWorkspaceModel.js';
import { renderWorkspacePanel } from './MovieWorkspacePanels.js';
import { MovieWorkspaceInteraction } from './MovieWorkspaceInteraction.js';
import { installMovieWorkspaceStyles } from './MovieWorkspaceStyles.js';

const TABS = Object.freeze([
	'timeline', 'sequences', 'cameras', 'graphs', 'materials', 'characters', 'json'
]);

export class MovieStudioWorkspace {
	constructor(host, project, handlers = {}) {
		installMovieWorkspaceStyles();
		this.host = host;
		this.handlers = handlers;
		this.project = project;
		this.tab = 'timeline';
		this.interaction = new MovieWorkspaceInteraction(this);
		this.render();
	}

	update(project) {
		this.project = project;
		this.render();
	}

	render() {
		this.model = createMovieWorkspaceModel(this.project);
		this.host.className = 'movie-workspace';
		this.host.innerHTML = `
			<nav class="movie-workspace-tabs" aria-label="Movie workspace">
				${TABS.map(tab => tabButton(tab, this.tab)).join('')}
			</nav>
			<section class="movie-workspace-panel" data-workspace-panel>
				${this.panelHtml()}
			</section>
		`;
		this.bindTabs();
		this.interaction.bind();
	}

	panelHtml() {
		if (this.tab !== 'json') return renderWorkspacePanel(this.model, this.tab);
		return `
			<div class="movie-workspace-actions">
				<button data-apply-json>Compile & apply JSON</button>
				<button data-copy-url>Copy GET URL</button>
			</div>
			<div class="movie-workspace-status" data-workspace-status></div>
			<textarea class="movie-workspace-json" data-workspace-json spellcheck="false">${escapeTextarea(this.model.json)}</textarea>
		`;
	}

	bindTabs() {
		this.host.querySelectorAll('[data-workspace-tab]').forEach(button => {
			button.addEventListener('click', () => {
				this.tab = button.dataset.workspaceTab;
				this.render();
			});
		});
	}
}

function tabButton(tab, selected) {
	return `<button data-workspace-tab="${tab}" aria-selected="${tab === selected}">
		${tab.charAt(0).toUpperCase() + tab.slice(1)}
	</button>`;
}

function escapeTextarea(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}
