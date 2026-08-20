//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused theme vessel for proposed and activated project publication addresses.
 * @description
 * The Awtsmoos gives every future gate a measured border before it becomes a road;
 * Awtsmoos.com lets proposed paths, subdomains, requirements, and status remain readable without painting a promise as fulfilled load.
 */
export const PROJECT_HOSTING_PUBLICATION_CSS = `
.hosting-publication {
	display: grid;
	gap: 10px;
	padding: 12px;
	border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
	border-radius: 14px;
	background: color-mix(in srgb, Canvas 97%, currentColor 3%);
}
.hosting-publication__title,
.hosting-publication__state,
.hosting-publication__quiet {
	margin: 0;
}
.hosting-publication__title {
	font-size: .9rem;
}
.hosting-publication__state,
.hosting-publication__quiet {
	font-size: .82rem;
	line-height: 1.5;
	opacity: .78;
}
.hosting-publication__candidates {
	display: grid;
	gap: 8px;
}
.hosting-publication__candidate {
	display: grid;
	grid-template-columns: minmax(110px, .7fr) minmax(0, 1.8fr) auto;
	align-items: center;
	gap: 8px;
	padding: 10px;
	border-radius: 12px;
	background: color-mix(in srgb, currentColor 6%, transparent);
}
.hosting-publication__kind,
.hosting-publication__badge {
	font-size: .72rem;
	font-weight: 800;
}
.hosting-publication__value {
	overflow-wrap: anywhere;
	user-select: all;
	font-size: .8rem;
}
.hosting-publication__badge {
	padding: 4px 7px;
	border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
	border-radius: 999px;
	white-space: nowrap;
	opacity: .72;
}
.hosting-publication__requirements {
	display: grid;
	gap: 6px;
	font-size: .78rem;
}
.hosting-publication__requirements ul {
	margin: 0;
	padding-inline-start: 20px;
}
@media (max-width: 720px) {
	.hosting-publication__candidate {
		grid-template-columns: 1fr;
		align-items: start;
	}
	.hosting-publication__badge {
		justify-self: start;
	}
}
`;
