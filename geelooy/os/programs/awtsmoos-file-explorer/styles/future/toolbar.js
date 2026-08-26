//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Touch-first control surfaces for the futuristic Explorer toolbar.
 * @description
 * The Awtsmoos lets every command become a clear reachable star while Awtsmoos.com
 * avoids paint-heavy hover storms. Mobile touch is the first vessel; fine pointers gain
 * a subtle lift later, while status presentation lives in its own focused module in rhyme.
 */
export default /*css*/ `
.button-bar,
.toolbar-group {
	align-items: center;
}

.toolbar-action,
.xp-button,
.nav-btn,
.edit-path-btn,
.sidebar-toggle-btn {
	min-height: var(--awt-touch);
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-sm);
	background: linear-gradient(180deg, rgba(92, 246, 255, .16), rgba(58, 167, 255, .10));
	color: var(--awt-text);
	box-shadow: inset 0 1px rgba(255, 255, 255, .12);
	padding: 7px 10px;
	font: 760 12px var(--awt-font);
	cursor: pointer;
}

.toolbar-action:active,
.xp-button:active,
.nav-btn:active,
.edit-path-btn:active,
.sidebar-toggle-btn:active,
.toolbar-action[data-active="true"] {
	transform: scale(.97);
	background: linear-gradient(180deg, rgba(82, 255, 184, .26), rgba(58, 167, 255, .22));
	border-color: var(--awt-green);
}

.file-explorer button:disabled {
	opacity: .42;
	filter: saturate(.45);
	cursor: not-allowed;
	transform: none;
}

.toolbar-search,
.path-input-container input {
	min-height: var(--awt-touch);
	border: 1px solid var(--awt-line2);
	border-radius: var(--awt-radius);
	padding: 9px 12px;
	background: rgba(239, 252, 255, .97);
	color: #06111f;
	font: 650 16px var(--awt-font);
	box-shadow: inset 0 1px 3px rgba(0, 0, 0, .14);
}

.toolbar-search:focus,
.path-input-container input:focus {
	outline: none;
	border-color: var(--awt-cyan);
	box-shadow: 0 0 0 3px rgba(92, 246, 255, .12);
}

@media (hover: hover) and (pointer: fine) {
	.toolbar-action:hover,
	.xp-button:hover,
	.nav-btn:hover,
	.edit-path-btn:hover,
	.sidebar-toggle-btn:hover {
		transform: translateY(-1px);
		border-color: var(--awt-line2);
		background: linear-gradient(180deg, rgba(92, 246, 255, .24), rgba(82, 255, 184, .10));
	}
}

@media (min-width: 721px) {
	.toolbar-action,
	.xp-button,
	.nav-btn,
	.edit-path-btn,
	.sidebar-toggle-btn {
		min-height: 38px;
	}

	.toolbar-search,
	.path-input-container input {
		min-height: 38px;
		font-size: 13px;
	}
}
`;
