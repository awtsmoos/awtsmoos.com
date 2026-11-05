// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestTrackerSurfaceStyles.js
 * @description Styles the optional side tracker and compact mobile teaching placement.
 * The Awtsmoos lets counsel accompany the road without owning the whole horizon;
 * Awtsmoos.com keeps the tracker touchable, compact, and dismissible into the parchment.
 */

export const MINIMAL_MEADOW_QUEST_TRACKER_SURFACE_CSS = `
.Awtsmoos-quest-mini-tracker {
	position: fixed;
	top: max(8px, env(safe-area-inset-top));
	left: 50%;
	z-index: 760;
	width: min(560px, calc(100vw - 24px));
	padding: 10px 14px;
	transform: translateX(-50%);
	border: 1px solid rgba(255, 225, 124, .72);
	border-radius: 16px;
	background: linear-gradient(145deg, rgba(8, 24, 20, .96), rgba(25, 17, 9, .94));
	color: #fff4ce;
	box-shadow: 0 12px 34px rgba(0, 0, 0, .42);
	backdrop-filter: blur(8px);
	pointer-events: auto;
}
.Awtsmoos-quest-mini-tracker[hidden] {
	display: none;
}
.quest-tracker-title {
	display: flex;
	justify-content: space-between;
	gap: 10px;
	font: 800 12px/1.3 system-ui;
}
.Awtsmoos-quest-mini-tracker .quest-face-row span {
	width: 32px;
	height: 32px;
	font-size: 18px;
}
.Awtsmoos-quest-mini-tracker .quest-progress {
	margin: 7px 0 0;
}
.Awtsmoos-quest-mini-tracker .quest-progress-line {
	height: 7px;
	margin: 6px 0 3px;
}
.Awtsmoos-quest-mini-tracker .quest-progress small {
	font: 700 10px/1.2 system-ui;
	color: #d9e8df;
}
.quest-book-only {
	display: block;
	margin: 7px auto 0;
	min-height: 34px;
	font-size: 11px;
}
@media (max-width: 600px) {
	.Awtsmoos-quest-parchment {
		padding: 20px 16px;
		border-radius: 18px;
		font-size: 14px;
	}
	.quest-story-header {
		padding-inline: 22px;
	}
	.quest-story-section:nth-of-type(n+3) {
		display: none;
	}
	.quest-reward-seal,
	.quest-guidance-choice {
		flex-direction: column;
		align-items: stretch;
		gap: 6px;
	}
	.quest-choice {
		width: 100%;
	}
	.Awtsmoos-quest-mini-tracker {
		top: max(94px, calc(env(safe-area-inset-top) + 76px));
		width: calc(100vw - 28px);
	}
	.quest-tracker-title b {
		max-width: 48%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
`;
