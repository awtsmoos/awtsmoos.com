//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keyboard-safe mobile bottom sheet and desktop modal shell for Explorer dialogs.
 * @description
 * The Awtsmoos lets a focused choice rise near the thumb without forcing the GPU
 * to resample the world behind it. Awtsmoos.com honors safe areas, keyboard space,
 * readable fields, and generous actions while static luminous depth carries the rhyme.
 */
export default /*css*/ `
.input-dialog-overlay {
	position: fixed;
	inset: 0;
	z-index: 100000;
	display: grid;
	align-items: end;
	padding: max(10px, env(safe-area-inset-top, 0px)) 10px;
	padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
	background: rgba(0, 6, 14, .76);
}

.input-dialog {
	width: 100%;
	max-height: calc(100dvh - 20px - env(safe-area-inset-top, 0px));
	overflow: auto;
	box-sizing: border-box;
	padding: 18px;
	display: grid;
	gap: 13px;
	border-radius: 24px 24px 16px 16px;
	overscroll-behavior: contain;
	background: linear-gradient(180deg, rgba(17, 53, 88, .98), rgba(5, 20, 37, .99));
	border: 1px solid var(--awt-line2);
	box-shadow: var(--awt-shadow), inset 0 1px rgba(255, 255, 255, .12);
}

.dialog-title {
	margin: 0;
	font: 820 18px var(--awt-font);
	letter-spacing: .01em;
	color: var(--awt-text);
}

.input-dialog input,
.input-dialog textarea {
	width: 100%;
	box-sizing: border-box;
	min-height: var(--awt-touch);
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-sm);
	padding: 10px 12px;
	background: rgba(0, 7, 16, .72);
	color: var(--awt-text);
	font: 500 16px var(--awt-font);
	outline: none;
}

.input-dialog input:focus,
.input-dialog textarea:focus {
	border-color: var(--awt-line2);
	box-shadow: 0 0 0 3px rgba(92, 246, 255, .12);
}

.dialog-buttons {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
}

.dialog-buttons button {
	min-height: var(--awt-touch);
	padding: 9px 12px;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-sm);
	background: rgba(255, 255, 255, .07);
	color: var(--awt-text);
	font: 760 13px var(--awt-font);
	cursor: pointer;
	touch-action: manipulation;
}

.dialog-buttons button[type="submit"],
.dialog-buttons button:last-child {
	background: linear-gradient(135deg, rgba(92, 246, 255, .24), rgba(82, 255, 184, .18));
	border-color: rgba(92, 246, 255, .46);
}

.dialog-buttons button:disabled {
	opacity: .5;
	cursor: wait;
}

@media (min-width: 721px) {
	.input-dialog-overlay {
		place-items: center;
		padding: 24px;
	}

	.input-dialog {
		width: min(460px, calc(100vw - 48px));
		max-height: min(780px, calc(100vh - 48px));
		border-radius: var(--awt-radius-lg);
	}

	.input-dialog input,
	.input-dialog textarea {
		font-size: 13px;
	}
}
`;
