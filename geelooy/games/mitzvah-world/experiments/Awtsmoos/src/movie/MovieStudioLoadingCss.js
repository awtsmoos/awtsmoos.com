// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLoadingCss.js
 * @description Styles complete localized loading, progress, recovery, error, mobile, and landscape states.
 * The Awtsmoos renews the unseen world while every stage remains honest and bright;
 * Awtsmoos.com shapes progress into a calm responsive vessel of readable light.
 */

export function movieStudioLoadingCss() {
	return `
		.movie-loading {
			position: fixed;
			inset: 0;
			z-index: 1000;
			display: grid;
			place-items: center;
			padding: max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
			background: radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--movie-accent) 16%, transparent), transparent 42%), var(--movie-bg-deep, #070a10);
			color: var(--movie-text, #f2f6fb);
			font: 600 clamp(14px, 2vw, 18px)/1.45 Inter, ui-sans-serif, system-ui, sans-serif;
		}
		.movie-loading-card {
			display: grid;
			gap: 14px;
			width: min(100%, 560px);
			padding: clamp(22px, 5vw, 42px);
			border: 1px solid var(--movie-border, #334155);
			border-radius: 22px;
			background: color-mix(in srgb, var(--movie-panel, #111827) 94%, transparent);
			box-shadow: var(--movie-shadow, 0 24px 70px rgb(0 0 0 / .48));
			backdrop-filter: blur(18px);
		}
		.movie-loading-brand,
		.movie-loading-title,
		.movie-loading-stage,
		.movie-loading-details { margin: 0; }
		.movie-loading-brand {
			color: var(--movie-accent, #7dd3fc);
			font-size: 11px;
			letter-spacing: .16em;
			text-transform: uppercase;
		}
		.movie-loading-title { font-size: clamp(22px, 5vw, 36px); line-height: 1.08; }
		.movie-loading-stage { color: var(--movie-text, #f2f6fb); }
		.movie-loading-details { color: var(--movie-text-muted, #a8b3c4); font-weight: 450; }
		.movie-loading-progress {
			height: 9px;
			overflow: hidden;
			border-radius: 999px;
			background: var(--movie-panel-raised, #1f2937);
		}
		.movie-loading-progress-bar {
			display: block;
			width: var(--movie-loading-progress, 0%);
			height: 100%;
			border-radius: inherit;
			background: linear-gradient(90deg, var(--movie-accent), var(--movie-accent-strong));
			transition: width 180ms ease;
		}
		.movie-loading-actions { display: flex; flex-wrap: wrap; gap: 10px; padding-top: 4px; }
		.movie-loading-actions button { min-width: 108px; min-height: 44px; }
		.movie-loading[data-state="ready"] { opacity: 0; pointer-events: none; transition: opacity 180ms ease; }
		.movie-loading[data-state="error"] .movie-loading-card { border-color: var(--movie-danger, #ff8f82); }
		.movie-loading[data-state="error"] .movie-loading-title { color: var(--movie-danger, #ff8f82); }
		@media (max-width: 640px) {
			.movie-loading { align-items: end; padding: 12px max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)); }
			.movie-loading-card { width: 100%; padding: 22px; border-radius: 20px; }
			.movie-loading-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
			.movie-loading-actions button { width: 100%; }
		}
		@media (max-height: 520px) and (orientation: landscape) {
			.movie-loading { align-items: center; }
			.movie-loading-card { max-height: calc(100dvh - 24px); overflow: auto; grid-template-columns: minmax(0, 1fr) minmax(180px, .7fr); align-items: center; }
			.movie-loading-brand, .movie-loading-title, .movie-loading-details { grid-column: 1; }
			.movie-loading-stage, .movie-loading-progress, .movie-loading-actions { grid-column: 2; }
		}
		@media (prefers-reduced-motion: reduce) {
			.movie-loading-progress-bar, .movie-loading[data-state="ready"] { transition: none; }
		}
	`;
}
