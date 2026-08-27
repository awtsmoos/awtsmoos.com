//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Futuristic SSH-drive form and add-card styling inside the Explorer future theme.
 * @description
 * The Awtsmoos lets encrypted distance wear a recognizable luminous garment;
 * Awtsmoos.com keeps credential state readable, private-key text calm, and the
 * add-remote doorway inviting without expensive animation, all measured in rhyme.
 */
export default /*css*/ `
.ssh-drive-dialog {
	max-height: calc(100dvh - 20px);
}

.ssh-drive-form,
.ssh-drive-field {
	display: grid;
	gap: 8px;
}

.ssh-drive-form {
	gap: 12px;
}

.ssh-drive-field > span {
	font: 760 11px var(--awt-font);
	letter-spacing: .05em;
	color: var(--awt-muted);
}

.ssh-drive-field textarea {
	min-height: 120px;
	resize: vertical;
	font-family: var(--awt-mono);
	line-height: 1.45;
}

.ssh-drive-hint,
.ssh-drive-status {
	margin: 0;
	font: 620 11px/1.5 var(--awt-font);
	color: var(--awt-muted);
}

.ssh-drive-status {
	min-height: 18px;
}

.ssh-drive-status[data-state="loading"] {
	color: var(--awt-cyan);
}

.ssh-drive-status[data-state="success"] {
	color: var(--awt-green);
}

.ssh-drive-status[data-state="error"] {
	color: #ff9ab0;
}

.drive-chip.ssh-drive-add {
	border-style: dashed;
	border-color: rgba(92, 246, 255, .48);
	background: linear-gradient(145deg, rgba(92, 246, 255, .10), rgba(82, 255, 184, .055));
}

.drive-chip.ssh-drive-add .drive-chip-icon {
	color: var(--awt-cyan);
	font-size: 26px;
}

.drive-chip.ssh-drive-add .drive-chip-state {
	color: var(--awt-green);
}

@media (hover: hover) and (pointer: fine) {
	.drive-chip.ssh-drive-add:hover {
		border-color: rgba(82, 255, 184, .72);
	}
}

@media (min-width: 721px) {
	.ssh-drive-dialog {
		width: min(540px, calc(100vw - 48px));
		max-height: min(820px, calc(100vh - 48px));
	}
}
`;
