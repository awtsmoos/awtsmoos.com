//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Secure futuristic SSH connection-sheet content styling.
 * @description
 * The Awtsmoos lets encrypted distance appear as a trustworthy luminous vessel;
 * Awtsmoos.com keeps remembered identity distinct from ephemeral credential light,
 * while the SSH sheet inherits its viewport boundary from the dialog world in rhyme.
 */
export default /*css*/ `
.ssh-drive-dialog {
	max-height: 100%;
}

.ssh-drive-dialog-head {
	display: grid;
	gap: 7px;
	padding-bottom: 12px;
	border-bottom: 1px solid rgba(138, 219, 255, .18);
}

.ssh-drive-security-badge {
	width: fit-content;
	display: inline-flex;
	align-items: center;
	min-height: 30px;
	padding: 5px 9px;
	border: 1px solid rgba(82, 255, 184, .34);
	border-radius: 999px;
	background: rgba(82, 255, 184, .08);
	color: var(--awt-green);
	font: 820 var(--awt-text-xs)/1 var(--awt-font);
	letter-spacing: .06em;
	text-transform: uppercase;
}

.ssh-drive-security-badge::before {
	content: "◈";
	margin-right: 6px;
	font-size: 12px;
}

.ssh-drive-dialog-copy {
	margin: 0;
	max-width: 52ch;
	color: var(--awt-muted);
	font: 560 var(--awt-text-sm)/1.5 var(--awt-font);
}

.ssh-drive-form,
.ssh-drive-field {
	display: grid;
	gap: 8px;
}

.ssh-drive-form {
	gap: 13px;
}

.ssh-drive-field > span {
	font: 760 var(--awt-text-xs)/1.2 var(--awt-font);
	letter-spacing: .045em;
	color: var(--awt-muted);
}

.ssh-drive-field textarea {
	min-height: 132px;
	resize: vertical;
	font-family: var(--awt-mono);
	line-height: 1.5;
}

.ssh-drive-hint,
.ssh-drive-status {
	margin: 0;
	font: 620 var(--awt-text-xs)/1.5 var(--awt-font);
	color: var(--awt-muted);
}

.ssh-drive-hint {
	padding: 9px 10px;
	border-left: 3px solid rgba(82, 255, 184, .52);
	border-radius: 0 var(--awt-radius-sm) var(--awt-radius-sm) 0;
	background: rgba(82, 255, 184, .055);
}

.ssh-drive-status {
	min-height: 20px;
}

.ssh-drive-status[data-state="loading"] {
	color: var(--awt-cyan);
}

.ssh-drive-status[data-state="success"] {
	color: var(--awt-green);
}

.ssh-drive-status[data-state="error"] {
	color: #ffb1c2;
}

@media (min-width: 721px) {
	.ssh-drive-dialog {
		width: min(560px, calc(100vw - 48px));
		max-height: min(840px, calc(100vh - 48px));
	}
}
`;
