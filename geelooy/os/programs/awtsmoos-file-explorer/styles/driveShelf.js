// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drive shelf presentation for connected computers and mounted worlds.
 * @description The Awtsmoos lets each remote vessel look tangible without becoming noisy; Awtsmoos.com gives state, access, and identity enough room to breathe and rhyme.
 */
export default /*css*/ `
.drive-shelf {
	display: flex;
	align-items: stretch;
	gap: 7px;
	min-height: 54px;
	padding: 6px 8px;
	overflow-x: auto;
	background: linear-gradient(#f8f8f8, #ece9d8);
	border-bottom: 1px solid #b9b7a8;
}

.drive-shelf-status {
	display: grid;
	place-items: center;
	flex: 0 0 auto;
	min-width: 126px;
	padding: 0 10px;
	font-size: 10px;
	font-weight: 700;
	color: #31516f;
	background: #eef6ff;
	border: 1px solid #9ebfe0;
	border-radius: 4px;
}

.drive-shelf-status[data-status="loading"] {
	font-style: italic;
}

.drive-shelf-status[data-status="error"] {
	color: #8a1f11;
	background: #fff0ed;
	border-color: #d99b92;
}

.drive-chip {
	display: grid;
	grid-template-columns: 28px minmax(92px, 1fr);
	grid-template-rows: auto auto auto;
	gap: 1px 7px;
	align-items: center;
	min-width: 180px;
	max-width: 270px;
	padding: 6px 9px;
	text-align: left;
	border: 1px solid #a8a595;
	border-radius: 4px;
	background: linear-gradient(#fff, #f2f0e5);
	color: #111;
	cursor: pointer;
}

.drive-chip:hover,
.drive-chip:focus-visible {
	outline: none;
	border-color: #5b91d2;
	box-shadow: 0 0 0 2px #d8e9ff inset;
}

.drive-chip-icon {
	grid-row: 1 / span 3;
	display: grid;
	place-items: center;
	width: 28px;
	height: 28px;
	font-size: 20px;
}

.drive-chip-label,
.drive-chip-meta,
.drive-chip-state {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.drive-chip-label {
	font-weight: 700;
}

.drive-chip-meta {
	color: #555;
	font-size: 10px;
}

.drive-chip-state {
	color: #31516f;
	font-size: 9px;
}

.drive-chip.mount-tunnel[data-state="connected"],
.drive-chip.mount-ssh[data-state="connected"] {
	border-left: 4px solid #4e9a51;
}

.drive-chip[data-permission="read-only"] .drive-chip-state {
	color: #1e3a8a;
}
`;
