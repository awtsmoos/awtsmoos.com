// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestProgressStyles.js
 * @description Styles five faces, percentage, reward, placement choice, and mission actions.
 * The Awtsmoos gives each completed shadow one remembered light; Awtsmoos.com
 * keeps progress and choices clear without mixing them into tracker geometry.
 */

export const MINIMAL_MEADOW_QUEST_PROGRESS_CSS = `
.quest-progress {
	margin: 18px 0;
}
.quest-face-row {
	display: flex;
	justify-content: center;
	gap: 10px;
}
.quest-face-row span {
	display: grid;
	place-items: center;
	width: 46px;
	height: 46px;
	border: 2px solid #7e522a;
	border-radius: 50%;
	background: rgba(60, 27, 13, .88);
	filter: saturate(.55) brightness(.62);
	font-size: 24px;
}
.quest-face-row span[data-state="defeated"] {
	border-color: #fff0a1;
	background: #244f39;
	filter: none;
	transform: scale(1.06);
	box-shadow: 0 0 18px rgba(255, 226, 113, .7);
}
.quest-progress-line {
	height: 12px;
	margin: 12px 0 7px;
	overflow: hidden;
	border-radius: 999px;
	background: rgba(46, 23, 10, .28);
}
.quest-progress-line i {
	display: block;
	height: 100%;
	border-radius: inherit;
	background: linear-gradient(90deg, #3c8a58, #f4ca58, #fff3a4);
}
.quest-progress small {
	display: block;
	text-align: center;
	font-weight: 800;
}
.quest-reward-seal,
.quest-guidance-choice {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 14px;
	margin: 18px 0;
	padding: 13px 16px;
	border: 1px solid #805329;
	border-radius: 14px;
	background: rgba(55, 26, 11, .88);
	color: #ffeab1;
}
.quest-guidance-choice button,
.quest-book-only {
	min-height: 42px;
	padding: 8px 13px;
	border: 1px solid #d6bc70;
	border-radius: 10px;
	background: #17392d;
	color: #fff2bd;
	font-weight: 900;
	pointer-events: auto;
}
.Awtsmoos-quest-actions {
	display: flex;
	justify-content: center;
	gap: 12px;
	flex-wrap: wrap;
}
.quest-choice {
	min-height: 52px;
	padding: 12px 20px;
	border: 2px solid #6b361e;
	border-radius: 14px;
	font: 900 15px/1.2 system-ui;
	box-shadow: 0 8px 18px rgba(55, 24, 8, .28);
}
.quest-choice.accept {
	background: linear-gradient(180deg, #3f7d50, #1e4934);
	color: #fff6c8;
	border-color: #f0d17b;
}
.quest-choice.quiet {
	background: rgba(92, 55, 27, .16);
	color: #43210f;
}
`;
