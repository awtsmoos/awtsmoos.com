B"H
Boruch Hashem
Blessed is He

# UI Execution Plan — Evidence-Locked

> The Awtsmoos gives each instant form; this pass gives broken vessels measured repair,
> Awtsmoos.com holds the paths together so source, cache, screen, and calendar share.

## Exact UI goals

1. One canonical Shabbos/Yom-Tov schedule resolver.
2. One coherent mobile/navigation release layer loaded by every public page.
3. Reservation layouts that cannot collapse into desktop columns on narrow screens.
4. Daily Study controls that never masquerade unavailable content as a broken reader.
5. Documentation and cache metadata aligned with the actual release.

## Planned source files

### New
- `main/sites/bais-shimon-5787/weeklyHolidayScheduleResolver.js`
- `main/sites/bais-shimon-5787/studySourceStatusView.js`
- `main/sites/bais-shimon-5787/study-source-status.css`
- `main/sites/bais-shimon-5787/release-ux-20260910.css`

### Whole-file rewrites
- `main/sites/bais-shimon-5787/weeklyServiceSchedule.js`
- `main/sites/bais-shimon-5787/weeklySignalView.js`
- `main/sites/bais-shimon-5787/weeklyShabbosView.js`
- `main/sites/bais-shimon-5787/studyLaneRegistry.js`
- `main/sites/bais-shimon-5787/chitasToolbarView.js`
- `main/sites/bais-shimon-5787/studyLayerToolbarView.js`
- `main/sites/bais-shimon-5787/reservation-responsive.css`
- `main/sites/bais-shimon-5787/styles.css`
- public HTML entry files only when cache/version inclusion requires it
- `main/sites/bais-shimon-5787/README.md`

## Holiday resolver contract

- Input: weekly date/calendar model and existing `holidayData.js` schedule data.
- Match holiday schedule entries to Friday/Shabbos civil dates in Brooklyn.
- Prefer holiday schedule for overlapping dates.
- Preserve regular weekly policy when no locally approved holiday schedule matches.
- Never synthesize a holiday service time from zmanim.
- Return explicit metadata indicating regular vs holiday source.

## Study source-status contract

- Ikar Hebrew remains active local content.
- English/Rashi are not rendered as selectable local tabs when no local approved layer exists.
- A compact source-status card states that those layers are available through the official Chabad study source.
- Official link opens clearly and accessibly.
- No JPS, copied protected text, invented translation, or implicit provenance substitution.

## Responsive release contract

- Mobile hamburger fixed and visible below the mobile breakpoint.
- Navigation trigger remains reachable above page content and safe-area edges.
- Reservation layout, grids, controls and side guidance collapse to one column at 900px and narrower.
- Grid children use `min-inline-size: 0` so long labels/emails do not force horizontal overflow.
- Inputs/selects/textareas use full inline size and proper box sizing.
- Essential content remains visible even if reveal JS fails or an old cache keeps stale motion state.
- `prefers-reduced-motion` preserves immediate visibility.

## Verification

- Re-read every new/rewritten file.
- Confirm all touched JS is syntactically valid.
- Confirm every code file remains under 120 lines; split if necessary.
- Browser checks at narrow mobile, tablet and desktop widths.
- Verify reserve page has no horizontal overflow.
- Verify menu appears and opens on every route.
- Verify Sep 12 This Shabbos shows the Rosh Hashanah schedule instead of regular Shabbos policy.
- Verify study reader no longer shows dead English/Rashi pseudo-tabs.
- Verify external official Chabad study action works.
- Verify console has no new errors.

## NEXT_ACTION

Read the exact current versions of all planned files one final time, then perform whole-file rewrites only.
