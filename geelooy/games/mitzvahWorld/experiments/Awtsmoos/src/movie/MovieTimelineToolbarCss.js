// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbarCss.js
 * @description Styles sticky timeline tools, commands, active states, scale controls, and tool cursors.
 * The Awtsmoos renews action before icon and cursor divide; Awtsmoos.com gives
 * every tool a visible, keyboard-readable, localized, responsive, and truthful side.
 */

export function movieTimelineToolbarCss() {
	return `
		.movie-timeline-commands {
			position: sticky;
			top: 0;
			left: 0;
			z-index: 30;
			display: flex;
			align-items: center;
			gap: 8px;
			width: max(100%, max-content);
			min-height: 50px;
			padding: 7px 10px;
			border-bottom: 1px solid var(--movie-border);
			background: color-mix(in srgb, var(--movie-surface-toolbar) 94%, transparent);
			backdrop-filter: blur(14px);
		}
		.movie-timeline-tool-group,
		.movie-timeline-command-group,
		.movie-timeline-scale-controls {
			display: inline-flex;
			align-items: center;
			gap: 4px;
		}
		.movie-timeline-tool-group {
			padding-right: 8px;
			border-right: 1px solid var(--movie-divider-subtle);
		}
		.movie-timeline-commands button {
			min-width: 36px;
			min-height: 36px;
			padding: 5px 9px;
			border: 1px solid transparent;
			border-radius: var(--movie-radius-sm);
			background: transparent;
			color: var(--movie-text-muted);
			font: 700 12px/1 system-ui, sans-serif;
			white-space: nowrap;
		}
		.movie-timeline-commands button:hover:not(:disabled),
		.movie-timeline-commands button:focus-visible {
			border-color: var(--movie-border-strong);
			background: var(--movie-panel-hover);
			color: var(--movie-text);
		}
		.movie-timeline-commands button[data-active="true"],
		.movie-timeline-commands button[aria-pressed="true"] {
			border-color: var(--movie-accent);
			background: color-mix(in srgb, var(--movie-accent) 22%, var(--movie-panel));
			color: var(--movie-accent-strong);
			box-shadow: inset 0 -2px 0 var(--movie-accent);
		}
		.movie-timeline-commands button:disabled {
			opacity: .38;
			cursor: not-allowed;
		}
		.movie-timeline-time {
			min-width: 76px;
			margin-left: auto;
			color: var(--movie-text);
			font: 700 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
			text-align: center;
		}
		.movie-timeline-scale-controls {
			padding-left: 8px;
			border-left: 1px solid var(--movie-divider-subtle);
		}
		.movie-timeline-shell[data-tool="blade"],
		.movie-timeline-shell[data-tool="blade"] .movie-clip {
			cursor: crosshair;
		}
		.movie-timeline-shell[data-tool="hand"],
		.movie-timeline-shell[data-tool="hand"] .movie-clip {
			cursor: grab;
			user-select: none;
		}
		.movie-timeline-shell[data-tool="hand"].is-panning,
		.movie-timeline-shell[data-tool="hand"].is-panning .movie-clip {
			cursor: grabbing;
		}
		.movie-timeline-shell[data-tool="zoom"],
		.movie-timeline-shell[data-tool="zoom"] .movie-clip {
			cursor: zoom-in;
		}
		@media (max-width: 640px) {
			.movie-timeline-commands { gap: 6px; padding-inline: 8px; overflow-x: auto; }
			.movie-timeline-commands button { min-width: 44px; min-height: 44px; }
			.movie-timeline-time { position: sticky; right: 0; background: var(--movie-surface-toolbar); }
		}
	`;
}
