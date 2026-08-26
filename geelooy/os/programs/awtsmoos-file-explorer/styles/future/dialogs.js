//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Viewport-bounded mobile bottom-sheet foundation for Explorer dialogs.
 * @description
 * The Awtsmoos lets a focused choice rise near the thumb without escaping the
 * screen that receives it. Awtsmoos.com binds safe-area padding inside the fixed
 * overlay box, preserves readable fields, and keeps touch vessels broad in rhyme.
 */
export default /*css*/ `
.input-dialog-overlay {
	position: fixed;
	inset: 0;
	z-index: 100000;
	display: grid;
	align-items: end;
	box-sizing: border-box;
	width: 100%;
	height: 100dvh;
	padding: max(10px, env(safe-area-inset-top, 0px)) 8px 0;
	overflow: hidden;
	background: rgba(0, 6, 14, .78);
}

.input-dialog {
	width: 100%;
	max-height: 100%;
	min-height: 0;
	overflow: auto;
	box-sizing: border-box;
	padding: 18px 16px calc(16px + env(safe-area-inset-bottom, 0px));
	display: grid;
	gap: 14px;
	border: 1px solid var(--awt-line2);
	border-bottom: 0;
	border-radius: 26px 26px 0 0;
	overscroll-behavior: contain;
	background: linear-gradient(180deg, rgba(17, 53, 88, .99), rgba(5, 20, 37, 1));
	box-shadow: 0 -18px 52px rgba(0, 0, 0, .38), inset 0 1px rgba(255, 255, 255, .12);
}

.input-dialog::before {
	content: "";
	width: 44px;
	height: 4px;
	margin: -7px auto 1px;
	border-radius: 999px;
	background: rgba(183, 210, 225, .46);
}

.dialog-title {
	margin: 0;
	font: 840 20px/1.15 var(--awt-font);
	letter-spacing: .005em;
	color: var(--awt-text);
}

.input-dialog input,
.input-dialog textarea {
	width: 100%;
	box-sizing: border-box;
	min-height: 50px;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-sm);
	padding: 11px 12px;
	background: rgba(0, 7, 16, .78);
	color: var(--awt-text);
	font: 540 16px var(--awt-font);
	outline: none;
}

.input-dialog input:focus,
.input-dialog textarea:focus {
	border-color: var(--awt-line2);
	box-shadow: 0 0 0 3px rgba(92, 246, 255, .13);
}

.dialog-buttons {
	position: sticky;
	bottom: 0;
	display: grid;
	grid-template-columns: minmax(112px, .7fr) minmax(0, 1.3fr);
	gap: 9px;
	padding-top: 4px;
	background: linear-gradient(180deg, transparent, rgba(5, 20, 37, .96) 28%);
}

.dialog-buttons button {
	min-height: 50px;
	padding: 10px 12px;
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-sm);
	background: rgba(255, 255, 255, .07);
	color: var(--awt-text);
	font: 780 var(--awt-text-sm)/1.2 var(--awt-font);
	cursor: pointer;
	touch-action: manipulation;
}

.dialog-buttons button[type="submit"] {
	background: linear-gradient(135deg, rgba(58, 167, 255, .34), rgba(82, 255, 184, .24));
	border-color: rgba(92, 246, 255, .62);
	box-shadow: inset 0 1px rgba(255, 255, 255, .12);
}

.dialog-buttons button:disabled {
	opacity: .52;
	cursor: wait;
}
`;
