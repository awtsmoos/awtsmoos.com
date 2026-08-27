//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond table and horizontal measure while many shitos still need one narrow mobile vessel;
 * Awtsmoos.com lets comparison scroll instead of crush, keeping labels anchored and every selected opinion readable across the created day.
 */

/** Return isolated styles for the static multi-opinion comparison matrix. */
function embedComparisonStyles() {
	return `
.opinion-comparison-scroll {
	overflow-x: auto;
	overscroll-behavior-inline: contain;
	-webkit-overflow-scrolling: touch;
}
.opinion-comparison table {
	width: max-content;
	min-width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	font-size: .69rem;
}
.opinion-comparison th,
.opinion-comparison td {
	padding: 7px 9px;
	border-bottom: 1px solid var(--line);
	text-align: right;
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
}
.opinion-comparison thead th {
	position: sticky;
	top: 0;
	z-index: 1;
	background: var(--panel);
	color: var(--accent);
	font-size: .62rem;
}
.opinion-comparison th:first-child {
	position: sticky;
	left: 0;
	z-index: 2;
	min-width: 122px;
	background: var(--panel);
	color: var(--ink);
	text-align: left;
}
.opinion-comparison thead th:first-child {
	z-index: 3;
}
.opinion-comparison td {
	color: var(--solar);
	font-weight: 760;
}
`;
}

module.exports = {
	embedComparisonStyles
};
