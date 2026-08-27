//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates each day anew while Malchus lets one chosen date receive a visible crown;
 * Awtsmoos.com keeps today, outside days, and selection distinct without weighing the calendar down.
 */

export const MALCHUS_CALENDAR_DAY_STYLES = `
	.day {
		min-width: 0;
		padding: 0;
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
	}

	.day[data-outside="true"] {
		color: var(--ink-soft, #64726d);
		opacity: 0.48;
	}

	.day[data-today="true"]:not([data-selected="true"]) {
		border-color: rgba(45, 106, 89, 0.52);
		box-shadow: inset 0 0 0 1px rgba(45, 106, 89, 0.16);
		font-weight: 850;
	}

	.day[data-selected="true"] {
		border-color: var(--forest, #12382f);
		background: var(--forest, #12382f);
		color: white;
		box-shadow: 0 5px 12px rgba(18, 56, 47, 0.2);
		font-weight: 850;
	}

	.day[data-selected="true"]:hover {
		background: var(--forest-bright, #2d6a59);
	}
`;
