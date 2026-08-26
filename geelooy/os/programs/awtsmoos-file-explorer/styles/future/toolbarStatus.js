//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Compact responsive status capsule for files and remote-world health.
 * @description
 * The Awtsmoos lets local selection and distant connection truth coexist without
 * consuming the command river. Awtsmoos.com uses a two-signal capsule that scrolls with
 * the rail on phones, expands gently on desktop, and keeps state legible in rhyme.
 */
export default /*css*/ `
.toolbar-status {
	flex: 0 0 auto;
	min-height: var(--awt-touch);
	display: inline-flex;
	align-items: center;
	gap: 7px;
	max-width: min(78vw, 320px);
	padding: 6px 10px;
	border: 1px solid rgba(154, 216, 255, .24);
	border-radius: 999px;
	background: linear-gradient(135deg, rgba(7, 25, 43, .92), rgba(20, 56, 79, .76));
	color: var(--awt-muted);
	font: 720 var(--awt-text-xs)/1.2 var(--awt-font);
	white-space: nowrap;
	box-shadow: inset 0 1px rgba(255, 255, 255, .07);
}

.toolbar-status-files,
.toolbar-status-worlds {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.toolbar-status-worlds {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	color: var(--awt-text);
}

.toolbar-status-worlds::before {
	content: "";
	flex: 0 0 auto;
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--awt-green);
	box-shadow: 0 0 9px rgba(82, 255, 184, .42);
}

.toolbar-status[data-state="connecting"] .toolbar-status-worlds::before {
	background: var(--awt-cyan);
	animation: awt-connection-pulse 1.25s ease-in-out infinite;
}

.toolbar-status[data-state="error"] {
	border-color: rgba(255, 102, 133, .42);
}

.toolbar-status[data-state="error"] .toolbar-status-worlds::before {
	background: var(--awt-danger);
	box-shadow: 0 0 9px rgba(255, 102, 133, .38);
}

.toolbar-status[data-state="needs-credential"] .toolbar-status-worlds::before,
.toolbar-status[data-state="offline"] .toolbar-status-worlds::before {
	background: var(--awt-gold);
	box-shadow: none;
}

@media (min-width: 721px) {
	.toolbar-status {
		min-height: 38px;
		max-width: 420px;
		font-size: 11px;
	}
}
`;
