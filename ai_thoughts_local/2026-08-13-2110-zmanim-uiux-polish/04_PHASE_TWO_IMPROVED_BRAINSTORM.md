B"H
Boruch Hashem
Blessed is He

# Phase Two — Improved Brainstorm

The Awtsmoos gives hierarchy before pixels and usefulness before decoration;
Awtsmoos.com should let one glance become orientation, then choice, then deeper contemplation.

## Above-the-fold design
A compact header carries the ב״ה mark, product name, and a small resources link. Directly below, a unified control deck contains location search, a date trigger, and compact shita selector. The calendar is collapsed initially and expands under the date trigger. The selected location remains visible even when search input is empty.

## Daily dashboard
The strongest surface is the next-zman card. It displays next label, exact time, countdown, and a contextual line such as "after Sunset · before Shabbos end" when surrounding events exist. Beside/below it sits a six-item key-times panel containing Alos, Sunrise, Shema, Chatzos, Sunset, and Tzeis. These times cover the day at a glance while the full 18 remain below.

## Timeline
Use a day rail from Alos to Tzeis with current position marker. Five labels stay textual. Selected-date mode omits the live marker and uses a quiet static track.

## Full list
Group sections remain, but cards become compact rows: label + time in the primary row; note beneath in smaller text. No repeated status badge except for next/unavailable. Passed rows recede slightly. This should cut vertical length substantially while preserving all information.

## Trust and sources
Combine the practical warning and USNO connection into one small trust strip. The warning remains explicit, not buried. Methodology stays a bottom details panel and includes API/source links.

## Recent places
Store the last five distinct selected places locally. Display them as small chips under the location control only when useful. Selecting a chip changes location without network search. This should be implemented in its own state helper and component responsibility.

## Mobile navigation
When the user scrolls beyond the main dashboard, a compact sticky bar may show abbreviated place, date, and the next zman time. It should use `position: sticky` inside the page rather than global fixed positioning to avoid safe-area and overlay problems.

## Desktop behavior
At >=900px, controls can become a three-column bar instead of a large two-column form block. The dashboard can become next-zman + key-times, with timeline full width beneath. The full list uses two columns of compact rows where natural.
