// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusBadgeCss.js
 * @description Holds the compact top-left realtime rail as layered spectral glass with gradient status language.
 * The Awtsmoos reveals connection as a quiet aurora instead of a block painted over the land;
 * Awtsmoos.com keeps multiplayer truth legible at the edge while the village remains open and grand.
 */

export const MULTIPLAYER_STATUS_BADGE_CSS = `
	.Awtsmoos-realtime-status {
		position: fixed;
		left: max(12px, env(safe-area-inset-left));
		top: max(12px, env(safe-area-inset-top));
		right: auto;
		z-index: 850;
		display: flex;
		align-items: center;
		gap: 8px;
		max-width: min(230px, 42vw);
		padding: 7px 10px;
		border: 1px solid rgba(118, 238, 218, .36);
		border-radius: 999px;
		background:
			radial-gradient(circle at 12% 20%, rgba(94, 255, 194, .18), transparent 35%),
			radial-gradient(circle at 90% 80%, rgba(176, 92, 255, .14), transparent 38%),
			linear-gradient(110deg, rgba(4, 23, 28, .86), rgba(15, 17, 44, .8), rgba(20, 8, 31, .78));
		box-shadow:
			0 10px 30px rgba(0, 0, 0, .25),
			inset 0 1px rgba(255, 255, 255, .08);
		backdrop-filter: blur(13px) saturate(1.25);
		font: 11px/1.15 system-ui, sans-serif;
		pointer-events: none;
	}

	.Awtsmoos-realtime-signal {
		width: 10px;
		height: 10px;
		flex: 0 0 auto;
		border-radius: 50%;
		background:
			radial-gradient(circle at 35% 30%, #fff8d9, #e9b85d 35%, #8d57d7 72%, transparent 75%);
		box-shadow: 0 0 12px rgba(255, 216, 119, .46);
	}

	.Awtsmoos-realtime-copy {
		display: grid;
		gap: 0;
		min-width: 0;
	}

	.Awtsmoos-realtime-copy small,
	.Awtsmoos-realtime-copy strong,
	.Awtsmoos-realtime-copy > span {
		background-clip: text;
		color: transparent;
		white-space: nowrap;
	}

	.Awtsmoos-realtime-copy small {
		background-image: linear-gradient(90deg, #8fffd2, #8edcff);
		font-size: 8px;
		font-weight: 800;
		letter-spacing: .12em;
	}

	.Awtsmoos-realtime-copy strong {
		background-image: linear-gradient(90deg, #fff1b9, #b9fbff);
		font-size: 11px;
	}

	.Awtsmoos-realtime-copy > span {
		background-image: linear-gradient(90deg, #c5dcd6, #cbb8e8);
		font-size: 9px;
	}

	.Awtsmoos-realtime-status[data-healthy="true"] .Awtsmoos-realtime-signal {
		background:
			radial-gradient(circle at 35% 30%, #effff8, #64f5ba 36%, #1d9275 66%, transparent 72%);
		box-shadow: 0 0 14px rgba(93, 255, 165, .56);
	}

	.Awtsmoos-realtime-status[data-state="error"] .Awtsmoos-realtime-signal,
	.Awtsmoos-realtime-status[data-state="failed"] .Awtsmoos-realtime-signal {
		background:
			radial-gradient(circle at 35% 30%, #fff0ed, #ff786e 38%, #852c54 68%, transparent 74%);
	}

	@media (max-width: 620px) {
		.Awtsmoos-realtime-status {
			left: 8px;
			top: 8px;
			padding: 6px 8px;
		}

		.Awtsmoos-realtime-copy small,
		.Awtsmoos-realtime-copy > span {
			display: none;
		}
	}
`;
