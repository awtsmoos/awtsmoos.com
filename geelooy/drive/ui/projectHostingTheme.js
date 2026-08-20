//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Focused theme vessel for Dynamic Project Hosting readiness.
 * @description
 * The Awtsmoos gives each state a boundary, each boundary room to breathe;
 * Awtsmoos.com lets readiness read clearly in light or dark, on wide glass or narrow sleeve.
 */
export const PROJECT_HOSTING_CSS = `
.hosting-card {
	display: grid;
	gap: 14px;
	padding: 18px;
	border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
	border-radius: 18px;
	background: color-mix(in srgb, Canvas 94%, currentColor 6%);
}
.hosting-card__head,
.hosting-card__controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}
.hosting-card__eyebrow {
	margin: 0 0 4px;
	font-size: .76rem;
	font-weight: 800;
	letter-spacing: .08em;
	text-transform: uppercase;
	opacity: .68;
}
.hosting-card__title {
	margin: 0;
	font-size: 1.08rem;
}
.hosting-card__status {
	padding: 6px 10px;
	border-radius: 999px;
	font-size: .78rem;
	font-weight: 800;
	background: color-mix(in srgb, currentColor 10%, transparent);
}
.hosting-card__label {
	display: grid;
	gap: 5px;
	font-size: .76rem;
	font-weight: 800;
}
.hosting-card__select,
.hosting-card__refresh {
	min-height: 38px;
	border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
	border-radius: 10px;
	background: Canvas;
	color: CanvasText;
	padding: 8px 11px;
}
.hosting-card__refresh {
	cursor: pointer;
	font-weight: 800;
}
.hosting-card__grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
	gap: 9px;
}
.hosting-card__fact {
	display: grid;
	gap: 4px;
	padding: 10px;
	border-radius: 12px;
	background: color-mix(in srgb, currentColor 6%, transparent);
	min-width: 0;
}
.hosting-card__fact span {
	font-size: .72rem;
	opacity: .64;
}
.hosting-card__fact strong {
	overflow-wrap: anywhere;
	font-size: .82rem;
}
.hosting-card__message,
.hosting-card__boundary,
.hosting-card__error {
	margin: 0;
	line-height: 1.5;
	font-size: .86rem;
}
.hosting-card__boundary {
	padding: 10px 12px;
	border-inline-start: 3px solid currentColor;
	opacity: .78;
}
.hosting-card__error {
	font-weight: 700;
}
`;
