//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Futuristic context-menu surfaces that become thumb-friendly sheets on mobile.
 * @description
 * The Awtsmoos lets each action rise from darkness in a readable glass vessel;
 * Awtsmoos.com preserves controller-owned desktop coordinates while narrow screens
 * become broad bottom sheets, with shared motion carrying every entrance in rhyme.
 */
export default /*css*/ `
.input-dialog,
.awtsmoos-modal,
.contextMenu {
	background: linear-gradient(180deg, rgba(9, 28, 53, .96), rgba(4, 15, 28, .98));
	color: var(--awt-text);
	border: 1px solid var(--awt-line2);
	border-radius: var(--awt-radius-lg);
	box-shadow: var(--awt-shadow), inset 0 1px rgba(255, 255, 255, .12);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
}

.contextMenu {
	min-width: 236px;
	padding: 9px;
	display: grid;
	gap: 4px;
}

.contextMenu::before {
	content: "Awtsmoos actions";
	display: block;
	padding: 5px 9px 7px;
	color: var(--awt-muted);
	font: 800 10px var(--awt-font);
	letter-spacing: .14em;
	text-transform: uppercase;
}

.contextMenu .menuItem {
	min-height: 42px;
	display: flex;
	align-items: center;
	padding: 9px 13px;
	border-radius: var(--awt-radius-sm);
	color: var(--awt-text);
	font-weight: 680;
}

.contextMenu .menuItem[data-action="Open Shell Here"] {
	color: var(--awt-green);
	border: 1px solid rgba(82, 255, 184, .26);
	background: rgba(82, 255, 184, .07);
}

.contextMenu .menuItem.disabled {
	opacity: .5;
	pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
	.contextMenu .menuItem:hover {
		background: linear-gradient(90deg, rgba(92, 246, 255, .22), rgba(82, 255, 184, .10));
	}
}

@media (max-width: 720px), (pointer: coarse) and (max-width: 900px) {
	.contextMenu.explorer-context-menu,
	.contextMenu {
		position: fixed !important;
		left: 10px !important;
		right: 10px !important;
		top: auto !important;
		bottom: calc(env(safe-area-inset-bottom, 0px) + 10px) !important;
		width: auto !important;
		min-width: 0 !important;
		max-width: none !important;
	}

	.contextMenu .menuItem {
		min-height: var(--awt-touch);
		justify-content: center;
		text-align: center;
		white-space: normal;
		font-size: 16px;
	}
}
`;
