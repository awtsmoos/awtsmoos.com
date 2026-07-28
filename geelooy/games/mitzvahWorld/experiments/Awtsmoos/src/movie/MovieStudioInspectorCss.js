// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInspectorCss.js
 * @description Styles the contextual inspector as a readable, scroll-safe editing vessel.
 * The Awtsmoos hides infinite depth inside each finite form; Awtsmoos.com lets details
 * unfold by section, without burying the creator beneath a storm.
 */

export function movieStudioInspectorCss() {
	return `
		.movie-studio-inspector {
			min-width: 0;
			min-height: 0;
			overflow: auto;
			border-left: 1px solid var(--movie-border);
			background: var(--movie-panel);
		}
		.movie-studio-inspector-header {
			position: sticky;
			top: 0;
			z-index: 3;
			display: flex;
			align-items: center;
			gap: var(--movie-space-2);
			padding: var(--movie-space-3) var(--movie-space-4);
			border-bottom: 1px solid var(--movie-border);
			background: rgb(17 25 37 / 0.96);
			backdrop-filter: blur(12px);
		}
		.movie-studio-inspector-header h2 {
			margin: 0 auto 0 0;
			font-size: 15px;
		}
		.movie-studio-section {
			padding: var(--movie-space-4);
			border-bottom: 1px solid var(--movie-border);
		}
		.movie-studio-section h3 {
			margin: 0 0 var(--movie-space-3);
			color: var(--movie-text);
			font-size: 13px;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}
		.movie-studio-field {
			display: grid;
			gap: var(--movie-space-1);
			margin-block: var(--movie-space-3);
		}
		.movie-studio-field > span {
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-studio-field input,
		.movie-studio-field select,
		.movie-studio-field textarea {
			width: 100%;
			min-height: var(--movie-control-height);
			padding: var(--movie-space-2) var(--movie-space-3);
		}
		.movie-studio-field textarea,
		.movie-studio-json {
			min-height: 180px;
			resize: vertical;
			font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			font-size: 12px;
			line-height: 1.55;
		}
		.movie-studio-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-studio-actions button {
			padding-inline: var(--movie-space-3);
		}
		.movie-studio-actions .movie-primary-action {
			border-color: var(--movie-accent);
			background: var(--movie-accent);
			color: var(--movie-accent-ink);
			font-weight: 700;
		}
		.movie-studio-project-summary {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-studio-summary-item {
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius);
			background: var(--movie-bg);
		}
		.movie-studio-summary-item span {
			display: block;
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-studio-summary-item strong {
			display: block;
			margin-top: var(--movie-space-1);
			overflow-wrap: anywhere;
		}
	`;
}
