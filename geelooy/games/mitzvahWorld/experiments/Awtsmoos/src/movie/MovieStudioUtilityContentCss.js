// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityContentCss.js
 * @description Styles command choices, render evidence/actions, empty states, and diagnostic text.
 * The Awtsmoos renews every finite fact beyond row and type; Awtsmoos.com lets
 * mobile taps and desktop keys read availability, progress, failure, retry, cancellation, and evidence clearly.
 */

export function movieStudioUtilityContentCss() {
	return `
		.movie-command-search {
			display: block;
			margin-bottom: var(--movie-space-2);
		}
		.movie-command-search input {
			width: 100%;
		}
		.movie-command-list,
		.movie-utility-list {
			display: grid;
			gap: var(--movie-space-2);
			margin-top: var(--movie-space-2);
		}
		.movie-command-entry {
			display: grid;
			gap: 2px;
			width: 100%;
			padding: var(--movie-space-2) var(--movie-space-3);
			text-align: left;
		}
		.movie-command-title {
			font-weight: 700;
		}
		.movie-command-meta,
		.movie-render-job span,
		.movie-render-job small,
		.movie-utility-empty {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-render-job {
			display: grid;
			gap: var(--movie-space-1);
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-divider-subtle);
			border-radius: var(--movie-radius);
			background: var(--movie-panel);
		}
		.movie-render-job progress {
			width: 100%;
		}
		.movie-render-job-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-1);
		}
		.movie-render-job-actions button {
			width: 100%;
			min-height: var(--movie-touch-height);
		}
		.movie-render-job.is-failed {
			border-color: var(--movie-danger);
		}
		.movie-render-job.is-completed {
			border-color: var(--movie-success);
		}
		.movie-diagnostics-output {
			margin: 0;
			white-space: pre-wrap;
			word-break: break-word;
			font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace;
		}
	`;
}
