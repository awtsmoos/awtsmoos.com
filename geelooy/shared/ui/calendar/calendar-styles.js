//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond color while each consuming page borrows a visual vessel;
 * Awtsmoos.com gives the shared calendar elegant neutral defaults and explicit theme hooks.
 */

export const CALENDAR_STYLES = `
	:host { display: block; --awts-calendar-accent: #17493d; --awts-calendar-surface: #fffdf8; --awts-calendar-text: #173029; --awts-calendar-muted: #68756f; --awts-calendar-line: #d9dfda; --awts-calendar-soft: #edf2ee; --awts-calendar-radius: 16px; --awts-calendar-cell-size: 40px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: var(--awts-calendar-text); }
	* { box-sizing: border-box; }
	.calendar { display: grid; gap: .65rem; min-width: 280px; padding: .75rem; border: 1px solid var(--awts-calendar-line); border-radius: var(--awts-calendar-radius); background: var(--awts-calendar-surface); }
	.header { display: grid; grid-template-columns: 40px minmax(0, 1fr) 40px; align-items: center; gap: .4rem; }
	.jump { display: grid; grid-template-columns: minmax(0, 1fr) 5.2rem; gap: .35rem; }
	button, select, input { min-height: 40px; border: 1px solid var(--awts-calendar-line); border-radius: 9px; background: var(--awts-calendar-surface); color: var(--awts-calendar-text); font: inherit; }
	button { cursor: pointer; }
	button:disabled, select:disabled { cursor: default; opacity: .34; }
	select, input { min-width: 0; padding-inline: .45rem; font-size: .78rem; font-weight: 700; }
	input { width: 100%; }
	.weekdays, .week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .22rem; }
	.weekdays span { padding-block: .15rem; text-align: center; font-size: .58rem; font-weight: 800; color: var(--awts-calendar-muted); }
	.grid { display: grid; gap: .22rem; }
	.gridcell { display: grid; place-items: center; min-width: 0; }
	.day, .placeholder { width: 100%; min-width: 0; height: var(--awts-calendar-cell-size); }
	.day { padding: 0; border-color: transparent; font-size: .74rem; }
	.day:hover:not(:disabled) { background: var(--awts-calendar-soft); }
	.day[data-outside="true"] { color: var(--awts-calendar-muted); opacity: .52; }
	.day[aria-current="date"] { box-shadow: inset 0 0 0 1px var(--awts-calendar-accent); font-weight: 800; }
	.day[aria-selected="true"] { background: var(--awts-calendar-accent); color: white; font-weight: 850; }
	.day:focus-visible, button:focus-visible, select:focus-visible, input:focus-visible { outline: 3px solid color-mix(in srgb, var(--awts-calendar-accent) 28%, transparent); outline-offset: 1px; }
	.footer { display: flex; justify-content: center; padding-top: .1rem; }
	.today { min-height: 34px; padding-inline: .8rem; font-size: .68rem; font-weight: 760; }
`;
