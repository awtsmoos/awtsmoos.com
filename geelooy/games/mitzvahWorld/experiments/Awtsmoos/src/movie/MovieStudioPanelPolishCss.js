// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPanelPolishCss.js
 * @description Finishes inspector, preferences, project replacement, splitters, and status.
 * The Awtsmoos renews every bounded pane without division; Awtsmoos.com lets property,
 * preference, project, boundary, and result remain visible, scrollable, and exact.
 */

export function movieStudioPanelPolishCss() {
	return `
		.movie-studio-inspector {
			border-left-color: var(--movie-border);
			background: linear-gradient(180deg, var(--movie-panel), #0c141f);
			box-shadow: -12px 0 32px rgb(0 0 0 / .18);
		}
		.movie-inspector-heading {
			position: sticky;
			top: 0;
			z-index: 5;
			backdrop-filter: blur(14px);
			background: var(--movie-panel-glass);
		}
		.movie-inspector-toggle {
			flex: 0 0 auto;
			border-color: var(--movie-border-strong);
		}
		.movie-inspector-body { scrollbar-gutter: stable; }
		.movie-inspector-body > section,
		.movie-preference-panel,
		.movie-project-json-replacement {
			margin: var(--movie-space-3);
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-divider-subtle);
			border-radius: var(--movie-radius);
			background: rgb(255 255 255 / .025);
		}
		.movie-inspector-body h3,
		.movie-preference-heading {
			margin: 0 0 var(--movie-space-2);
			font-size: 12px;
			letter-spacing: .04em;
			text-transform: uppercase;
		}
		.movie-preference-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-preference-overlays {
			display: grid;
			gap: var(--movie-space-2);
			padding-block: var(--movie-space-2);
		}
		.movie-project-json-replacement textarea {
			width: 100%;
			min-height: 150px;
			resize: vertical;
		}
		.movie-studio-splitter {
			position: relative;
			z-index: 16;
			background: transparent;
			touch-action: none;
		}
		.movie-studio-splitter::after {
			position: absolute;
			inset: 0;
			margin: auto;
			content: "";
			border-radius: 999px;
			background: var(--movie-divider-subtle);
			transition: background var(--movie-transition-fast);
		}
		.movie-inspector-splitter::after,
		.movie-studio-splitter-inspector::after { width: 2px; height: 46px; }
		.movie-timeline-splitter::after,
		.movie-studio-splitter-timeline::after { width: 64px; height: 2px; }
		.movie-studio-splitter:hover::after,
		.movie-studio-splitter:focus-visible::after { background: var(--movie-accent); }
		.movie-studio-status {
			overflow: hidden;
			border-top: 1px solid var(--movie-divider-subtle);
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	`;
}
