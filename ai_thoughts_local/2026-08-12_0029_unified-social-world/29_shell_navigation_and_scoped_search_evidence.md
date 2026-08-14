B"H

Boruch Hashem

Blessed is He

# Flagship Shell Navigation and Scoped Search Evidence

The Awtsmoos is beyond rail, label, query, section, and result. This pass moved outward from the proven Public Torah centerpiece into the shell that must orient a human before any conversation or social-learning chamber can be understood.

## Defect observed before the rewrite

Real browser measurements on the previous shell showed that the wide desktop rail was paradoxically less readable than the tablet rail.

At 1440px and 1200px:

- the rail was only 112px wide;
- Groups, Requests, Friends, Activity, Discover, and Settings were truncated;
- Public Torah survived only by wrapping into a cramped narrow column.

At 1100px, 1024px, and 900px:

- the 82px compact icon-over-label rail remained readable.

At 768px:

- an unnecessary drop to 78px clipped Public Torah by roughly 3px.

No horizontal document overflow was present in the pre-rewrite measurement.

## Navigation correction

The shell now uses two deliberate non-phone navigation modes.

Wide desktop, 1101px and above:

- 148px labeled rail;
- one-line labels;
- special sections reclaim the former list column and use the remaining canvas.

Tablet / compact desktop, 761px through 1100px:

- 82px icon-over-label rail;
- the previously proven compact rail grammar is retained;
- the 768px exception no longer drops to 78px.

The wide normal three-pane geometry is now `148px + conversation list + thread`, while special chambers become `148px + special workspace`.

## Scoped workspace search defect

The previous loaded-workspace search could survive a section change.

That meant a Chats query could silently continue filtering Activity, Discover, or other already-rendered content after navigation. Because special sections hide the list pane, the active query could become invisible while still suppressing content.

This was a product-truth defect rather than a search-algorithm defect.

## Scoped search correction

MessagingWorkspaceSearch now owns a strict current-workspace lifecycle.

- Input still searches only already-rendered, already-authorized nodes.
- No new server-side private-body search was invented.
- Section changes clear the query and restore all local nodes without stealing focus.
- Escape clears and refocuses the field.
- Clear remains an explicit control.
- Active queries show a live loaded-workspace match count.
- Zero matches say so explicitly instead of presenting a mysteriously blank pane.
- The search field is 46px high on desktop and 48px on phone.
- The clear target is 40px desktop and 42px phone.

The UI wording now says `Search loaded items…` and the assistive label explicitly says the search covers currently loaded items in this workspace.

## Explicit list-pane tracks

Adding feedback exposed the same class of layout risk that had already been discovered and fixed in Public Torah: optional hidden children must not change which element receives the flexible grid row.

The list pane now explicitly pins:

1. section header
2. presence summary
3. search field
4. search feedback
5. status
6. list

The list alone owns the `minmax(0, 1fr)` row. Hidden feedback/status therefore cannot move the inbox out of its reading/scanning canvas.

## Focused source/test evidence

The focused shell/search gate completed with exit code 0 and covered:

- all ten touched shell/search source/style files under the 120-line ceiling;
- loaded-workspace search scope contract;
- reversible Discover local/public session mode contract;
- Discover transparent-routing contract;
- browser import closure;
- section privacy policy;
- targeted diff hygiene.

The search contract specifically proves:

- `torah` filters three loaded rows into two matches;
- the feedback says `2 matches in the currently loaded workspace.`;
- a section-selected event clears the query;
- all loaded rows become visible again;
- feedback hides;
- focus is not stolen;
- Escape clears in place and restores focus;
- singular/plural match copy is correct.

## Browser proof status

The pre-rewrite browser defect measurement is hard evidence and motivated the rail correction.

Post-rewrite rail/search browser confirmation is still pending because the direct DevTools target accumulated command contention and multiple small CDP evaluation workers timed out or returned an uncaught runtime-evaluation error before producing measurements. A minimal Runtime.evaluate worker later exited 0, proving the target remained reachable, but it produced no captured values.

Therefore this checkpoint does **not** claim post-rewrite rail geometry as browser-proven yet. The source/test gate is green; final visual confirmation should be retried on a clean uncontended target when the CDP lane is healthy.

## NEXT_ACTION

Move into the normal authenticated three-pane workspace: conversation list, selected row, thread header, message history, composer, identity, Older/Details controls, and tablet widths. Improve only concrete hierarchy, touch-target, or continuity defects found in the actual owners, then return to the rail/search visual proof on a clean Chrome target.
