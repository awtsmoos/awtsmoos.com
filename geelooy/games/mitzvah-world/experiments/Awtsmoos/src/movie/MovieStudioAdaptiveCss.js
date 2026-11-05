// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAdaptiveCss.js
 * @description Adapts the real editor container into desktop, tablet, and mobile workspaces.
 * The Awtsmoos renews one creative purpose through every width; Awtsmoos.com lets monitor,
 * timeline, transport, inspector, and safe areas rearrange without shrinking into confusion.
 */

export function movieStudioAdaptiveCss() {
	return `
		.Awtsmoos-movie-studio[data-workspace-mode="desktop"] .movie-studio-workspace {
			grid-template-columns: minmax(420px, 1fr) var(--movie-splitter-size) minmax(300px, min(var(--movie-inspector-width), 38vw));
		}
		.Awtsmoos-movie-studio[data-workspace-mode="tablet"] {
			--movie-timeline-row-height: clamp(250px, var(--movie-timeline-height), 42vh);
		}
		.Awtsmoos-movie-studio[data-workspace-mode="tablet"] .movie-studio-workspace,
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-workspace {
			grid-template-columns: minmax(0, 1fr);
		}
		.Awtsmoos-movie-studio[data-workspace-mode="tablet"] .movie-inspector-splitter,
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-inspector-splitter {
			display: none;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="tablet"] .movie-studio-inspector {
			position: absolute;
			inset: 0 0 0 auto;
			z-index: 30;
			width: min(420px, calc(100% - 48px));
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-lg) 0 0 var(--movie-radius-lg);
			box-shadow: var(--movie-shadow-lg);
			transform: translateX(calc(100% + 24px));
			visibility: hidden;
			transition: transform var(--movie-transition), visibility var(--movie-transition);
		}
		.Awtsmoos-movie-studio[data-workspace-mode="tablet"].is-inspector-open .movie-studio-inspector {
			transform: translateX(0);
			visibility: visible;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] {
			--movie-timeline-row-height: clamp(250px, var(--movie-timeline-height), 46vh);
			--movie-track-header-width: min(136px, 35vw);
			--movie-track-height: 58px;
			grid-template-rows: auto minmax(180px, 1fr) var(--movie-splitter-size) var(--movie-timeline-row-height) auto;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-bar {
			min-height: 54px;
			padding: 6px max(8px, var(--movie-safe-right)) 6px max(8px, var(--movie-safe-left));
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-identity {
			min-width: 128px;
			max-width: 46vw;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-kicker,
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-brand [data-project-meta],
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-primary-actions {
			display: none;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-toolbar-scroll {
			margin-left: auto;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-program-heading strong,
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-program-controls output {
			display: none;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-preview-stage {
			padding: var(--movie-space-2);
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-preview-frame {
			width: 100%;
			border-radius: var(--movie-radius);
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-transport {
			justify-content: center;
			gap: 5px;
			padding: 6px max(8px, var(--movie-safe-right)) 6px max(8px, var(--movie-safe-left));
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-transport-edge button:nth-child(2),
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-rate-control span {
			display: none;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-transport button {
			min-width: 42px;
			min-height: var(--movie-touch-height);
			padding-inline: 8px;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-studio-inspector {
			position: fixed;
			inset: auto var(--movie-safe-right) var(--movie-safe-bottom) var(--movie-safe-left);
			z-index: 40;
			width: auto;
			max-height: min(76dvh, 680px);
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-xl) var(--movie-radius-xl) 0 0;
			box-shadow: var(--movie-shadow-lg);
			transform: translateY(calc(100% + 28px));
			visibility: hidden;
			transition: transform var(--movie-transition), visibility var(--movie-transition);
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"].is-inspector-open .movie-studio-inspector {
			transform: translateY(0);
			visibility: visible;
		}
		.Awtsmoos-movie-studio[data-workspace-mode="mobile"] .movie-inspector-heading::before {
			display: block;
			content: "";
			width: 42px;
			height: 4px;
			margin: 0 auto 8px;
			border-radius: 999px;
			background: var(--movie-border-strong);
		}
	`;
}
