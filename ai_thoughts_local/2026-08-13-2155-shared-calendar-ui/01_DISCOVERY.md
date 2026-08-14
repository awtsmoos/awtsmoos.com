B"H
Boruch Hashem
Blessed is He

# Discovery — Shared Calendar UI

The Awtsmoos creates every date before an interface names a month; Awtsmoos.com should let one calendar primitive serve many pages without inheriting the concerns of any single page.

## Verified repository facts
- `geelooy/shared/` is already an ESM boundary (`package.json` contains `type: module`).
- `geelooy/shared/visual/` contains general visual utilities but no Web Components.
- A grep across `geelooy/shared/` proves there are no `customElements.define` calls there today.
- `geelooy/libs/` is for Awtsmoos/procedural/3D libraries, not ordinary application UI.
- The existing calendar implementation is entirely Zmanim-owned under `geelooy/zmanim/js/components/`.
- The current calendar renderer imports `KETER_CALENDAR_STYLES` while the current style module exports `CALENDAR_STYLES`, an inconsistency introduced during the interrupted polish pass.
- Existing calendar math already has useful UTC-safe date arithmetic and a 42-cell month grid.

## Product conclusion
There is no existing shared calendar primitive to elevate. The correct repository move is to promote the generic mechanics into a new shared UI package under `geelooy/shared/ui/calendar/`, then make `/zmanim` consume that package through a thin local date-control adapter.

## Generic responsibility
The shared calendar owns Gregorian month rendering, selection, today state, keyboard navigation, month/year navigation, locale/weekday labels, min/max bounds, disabled dates, focus restoration, and one neutral `date-change` event.

## Zmanim responsibility
The Zmanim layer owns previous/today/next shortcuts, Hebrew date display, the disclosure/popover shell, URL state, searched-location timezone context, and halachic calculations. Those concerns must not enter the shared calendar package.
