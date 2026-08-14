B"H
Boruch Hashem
Blessed is He

# Architecture Pass — Generic Calendar

The Awtsmoos renews every boundary, so a shared calendar should have a narrow public contract and many small internal vessels rather than one page-specific monolith.

## Shared package target
`geelooy/shared/ui/calendar/`

Files:
- `date-math.js` — UTC-safe ISO parsing, formatting, day/month/year shifts, month grid, week boundaries, bounds helpers.
- `calendar-model.js` — derives visible month cells, labels, selected/today/disabled/outside state.
- `calendar-styles.js` — Shadow DOM visual system using CSS custom-property hooks.
- `calendar-renderer.js` — semantic grid markup only.
- `calendar-keyboard.js` — Arrow/Home/End/PageUp/PageDown/Shift+PageUp/PageDown movement.
- `calendar-element.js` — public Web Component lifecycle and events.
- `index.js` — stable imports/exports.
- `README.md` — public contract and examples.
- `test/date-math.test.mjs` and `test/calendar-model.test.mjs` — pure behavior tests.

## Public element
`<awtsmoos-calendar>`

Properties/attributes:
- `value="YYYY-MM-DD"`
- `min="YYYY-MM-DD"`
- `max="YYYY-MM-DD"`
- `locale="en-US"`
- `week-start="0"` (0 Sunday through 6 Saturday)
- `show-outside-days` boolean

Events:
- `date-change`, composed+bubbling, detail `{ date }`.
- `month-change`, composed+bubbling, detail `{ month }`.

Methods:
- `focusDate(isoDate)`
- `showToday()`

## Accessibility
- Grid container with `role="grid"` and month label.
- Weekday headers exposed as column headers.
- Date buttons use `aria-selected`, `aria-current="date"` for today, and disabled semantics where applicable.
- Roving tabindex: one date cell tabbable at a time.
- Escape remains the responsibility of the containing popover/sheet, not the calendar.

## Visual design
The calendar must be neutral enough for reuse, but high quality by default. It exposes theme hooks such as `--awts-calendar-accent`, `--awts-calendar-surface`, `--awts-calendar-text`, `--awts-calendar-muted`, `--awts-calendar-radius`, and `--awts-calendar-cell-size` so Zmanim can inherit its forest/paper visual language without shared code importing Zmanim CSS.
