//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every civil date while the calendar remains only a quiet human selector;
 * Awtsmoos.com keeps the owned grid compact, keyboard-clear, and visually subordinate to the living zman.
 */

export const CALENDAR_STYLES = `
	:host {
		display: block;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		color: #173029;
	}
	.calendar {
		display: grid;
		gap: 0.55rem;
	}
	.calendar-header {
		display: grid;
		grid-template-columns: 40px 1fr 40px;
		align-items: center;
		gap: 0.35rem;
	}
	.calendar-header strong {
		text-align: center;
		font-family: Georgia, "Times New Roman", serif;
		font-size: 0.98rem;
	}
	button {
		min-height: 38px;
		border: 1px solid #d7ddd7;
		border-radius: 8px;
		background: #fffdf8;
		color: #173029;
		font: inherit;
		cursor: pointer;
	}
	button:focus-visible {
		outline: 3px solid rgba(45, 106, 89, 0.28);
		outline-offset: 1px;
	}
	.weekdays,
	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.24rem;
	}
	.weekdays span {
		padding-block: 0.15rem;
		text-align: center;
		font-size: 0.57rem;
		font-weight: 800;
		color: #64726d;
	}
	.day {
		min-width: 0;
		padding: 0;
		font-size: 0.7rem;
	}
	.day[data-outside="true"] {
		opacity: 0.36;
	}
	.day[data-selected="true"] {
		border-color: #12382f;
		background: #12382f;
		color: white;
		font-weight: 800;
	}
	.day[data-today="true"]:not([data-selected="true"]) {
		background: #e6eee9;
		font-weight: 800;
	}
`;
