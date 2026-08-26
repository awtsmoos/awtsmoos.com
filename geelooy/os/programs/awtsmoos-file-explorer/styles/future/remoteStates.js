//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared readable state-and-action language for every mounted Explorer world.
 * @description
 * The Awtsmoos renews connection, waiting, error, and rest without confusing one
 * garment for another. Awtsmoos.com keeps words primary, color secondary, and the
 * next action visibly distinct, so every remote-world state can truthfully rhyme.
 */
export default /*css*/ `
.remote-world-status {
	min-width: 0;
	display: inline-flex;
	align-items: center;
	gap: 7px;
	width: fit-content;
	max-width: 100%;
	padding: 3px 7px;
	border: 1px solid rgba(138, 219, 255, .18);
	border-radius: 999px;
	background: rgba(0, 8, 18, .36);
	font: 680 var(--awt-text-xs)/1.25 var(--awt-font);
	color: var(--awt-muted);
	white-space: nowrap;
}

.remote-world-status::before {
	content: "";
	flex: 0 0 auto;
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--awt-faint);
}

.remote-world-state-label,
.remote-world-action {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.remote-world-action {
	color: var(--awt-text);
	font-weight: 820;
}

.remote-world-action::before {
	content: "·";
	margin-right: 7px;
	color: var(--awt-faint);
}

[data-state="connected"] .remote-world-status::before {
	background: var(--awt-green);
	box-shadow: 0 0 9px rgba(82, 255, 184, .48);
}

[data-state="connecting"] .remote-world-status::before {
	background: var(--awt-cyan);
}

[data-state="needs-credential"] .remote-world-status,
[data-state="snapshot"] .remote-world-status {
	border-color: rgba(255, 209, 102, .34);
	background: rgba(255, 209, 102, .075);
}

[data-state="needs-credential"] .remote-world-status::before,
[data-state="snapshot"] .remote-world-status::before {
	background: var(--awt-gold);
}

[data-state="error"] .remote-world-status {
	border-color: rgba(255, 102, 133, .42);
	background: rgba(255, 102, 133, .08);
}

[data-state="error"] .remote-world-status::before {
	background: var(--awt-danger);
}

[data-state="offline"] .remote-world-status::before {
	background: var(--awt-faint);
}

.drive-chip[data-state="error"],
.drive-node[data-state="error"] .tree-node-content {
	border-color: rgba(255, 102, 133, .58);
}

.drive-chip[data-state="offline"],
.drive-node[data-state="offline"] .tree-node-content {
	opacity: .76;
}

.drive-chip[data-state="needs-credential"],
.drive-node[data-state="needs-credential"] .tree-node-content {
	border-style: dashed;
	border-color: rgba(255, 209, 102, .62);
}
`;
