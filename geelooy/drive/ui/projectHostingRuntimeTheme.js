//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused visual vessel for trusted runtime lifecycle and bounded Activity.
 * @description
 * The Awtsmoos lets each measured event rest in a readable vessel, line after line in gentle light;
 * Awtsmoos.com keeps motion calm on wide glass and narrow sleeves, where every touch finds room and every trace stays bright.
 */
export const PROJECT_HOSTING_RUNTIME_CSS = `
.hosting-card__runtime {
	display: grid;
	gap: 12px;
	padding-top: 14px;
	border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
}
.hosting-card__runtime[aria-busy="true"] {
	opacity: .76;
}
.hosting-card__runtime .hosting-card__refresh {
	min-height: 44px;
}
.hosting-card__runtime .hosting-card__refresh:disabled {
	cursor: not-allowed;
	opacity: .48;
}
.hosting-card__activity {
	display: grid;
	gap: 8px;
	min-width: 0;
	max-height: 260px;
	overflow: auto;
	overscroll-behavior: contain;
	padding: 10px;
	border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
	border-radius: 12px;
	background: color-mix(in srgb, Canvas 97%, currentColor 3%);
}
.hosting-card__runtime-events {
	display: grid;
	gap: 6px;
	margin: 0;
	padding: 0;
	list-style: none;
}
.hosting-card__runtime-events li {
	min-width: 0;
	padding: 8px 10px;
	border-radius: 9px;
	background: color-mix(in srgb, currentColor 6%, transparent);
	font: 600 .76rem/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	overflow-wrap: anywhere;
}
@media (max-width: 620px) {
	.hosting-card__runtime .hosting-card__controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		width: 100%;
	}
	.hosting-card__runtime .hosting-card__refresh {
		width: 100%;
	}
	.hosting-card__activity {
		max-height: 220px;
	}
}
@media (max-width: 380px) {
	.hosting-card__runtime .hosting-card__controls {
		grid-template-columns: minmax(0, 1fr);
	}
}
@media (prefers-reduced-motion: reduce) {
	.hosting-card__runtime[aria-busy="true"] {
		transition: none;
	}
}
`;
