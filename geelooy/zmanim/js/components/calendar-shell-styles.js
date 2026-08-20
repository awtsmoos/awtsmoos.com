//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives the calendar a vessel before any numbered day can appear;
 * Awtsmoos.com lets Yesod hold navigation, focus, and weekly order calm and clear.
 */

export const YESOD_CALENDAR_SHELL_STYLES = `
	:host {
		display: block;
		color: var(--ink, #173029);
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
	}

	.calendar {
		display: grid;
		gap: 0.62rem;
		padding: 0.7rem;
		border: 1px solid var(--line, #d7ddd7);
		border-radius: 14px;
		background: linear-gradient(180deg, var(--paper-raised, #fffdf8), #faf9f4);
		box-shadow: 0 12px 28px rgba(18, 56, 47, 0.09);
	}

	.calendar-header {
		display: grid;
		grid-template-columns: 42px minmax(0, 1fr) 42px;
		align-items: center;
		gap: 0.4rem;
	}

	.calendar-header strong {
		overflow: hidden;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: Georgia, "Times New Roman", serif;
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	button {
		min-height: 40px;
		border: 1px solid var(--line, #d7ddd7);
		border-radius: 9px;
		background: var(--paper-raised, #fffdf8);
		color: var(--ink, #173029);
		font: inherit;
		cursor: pointer;
		transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease, transform 140ms ease;
	}

	button:hover {
		border-color: var(--forest-bright, #2d6a59);
		background: var(--mist, #e6eee9);
	}

	button:active {
		transform: translateY(1px);
	}

	button:focus-visible {
		outline: 3px solid rgba(45, 106, 89, 0.3);
		outline-offset: 2px;
	}

	.month-nav {
		font-size: 1.3rem;
		font-weight: 800;
		line-height: 1;
	}

	.weekdays,
	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.28rem;
	}

	.weekdays span {
		padding-block: 0.12rem;
		text-align: center;
		font-size: 0.59rem;
		font-weight: 850;
		letter-spacing: 0.04em;
		color: var(--ink-soft, #64726d);
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}

		button:active {
			transform: none;
		}
	}
`;
