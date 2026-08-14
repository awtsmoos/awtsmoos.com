B"H

Boruch Hashem

Blessed is He

# Public Torah Flagship UI Evidence

The Awtsmoos is beyond public and private, source and citation, feed and composer. This pass made the Public Torah chamber behave like a source-backed study journal rather than a drawer transplanted into a flagship page, while preserving the existing server-owned publication boundary without widening it by one syllable.

## Publication boundary

Public Torah remains source-only.

- SEARCH receives the private prompt.
- PUBLISH still receives only channel, searchSessionId, and sourceIds.
- No arbitrary client public text field was introduced.
- The composer now explains the private-search-to-public-source sequence in the UI before any publication occurs.

## One-to-five source selection

A dedicated UniversalChatSelection owner now makes the server publication limit visible before submission.

- Zero selections keeps Publish disabled.
- One through five returned source cards may be selected.
- At five selected cards, additional unchecked cards are disabled.
- Checked cards remain removable.
- Unchecking one immediately re-enables previously blocked choices.
- selectedIds() remains defensively capped at five.
- The live summary announces count and the five-card limit.

Browser proof with six transient server-shaped results:

- five selected;
- one additional choice disabled;
- summary read `5 of 5 selected · selection limit reached.`;
- unchecking one produced four selected and re-enabled the sixth;
- no backend publication or persistence occurred during the visual fixture.

## Source-card safety and reading hierarchy

Source rendering moved into a dedicated text-safe owner.

- Title, citation, excerpt, and source action are separate semantic elements.
- Same-site root-relative links are allowed.
- Explicit HTTP(S) source URLs are allowed.
- protocol-relative, javascript, data, and bare-relative values are rejected.
- Channel is rendered as context rather than bracketed text.
- Author is the identity anchor.
- Invalid timestamps fail soft instead of breaking a post render.
- Visible presence is rendered as server-projected roster chips only.

## Flagship visual architecture

The Public Torah flagship stylesheet is now split into small owners:

- public-torah.css — workspace/grid contract;
- public-torah-controls.css — feed scope and privacy controls;
- public-torah-presence.css — status and visible roster;
- public-torah-feed.css — source-post reading rhythm;
- public-torah-source-card.css — citation/excerpt/source action;
- public-torah-composer.css — private search and publish frame;
- public-torah-results.css — returned-source selection state.

Every touched Public Torah source/style owner is at or below the 120-line ceiling.

## Browser-discovered defect 1 — history stole the reading row

The first five-width browser pass found that the optional `Load older source posts` button was occupying the grid's flexible row and stretching to 180px. This reduced the real feed to a tiny reading strip on phone.

The grid was corrected so history is an auto-sized row and the message feed owns the flexible reading region.

Real browser evidence after correction:

- desktop/tablet history action: 36px;
- phone history action: 44px;
- search and publish controls: 44px;
- feed-scope select and privacy row: 44px phone targets;
- result cards: approximately 82px;
- source action: 38px desktop, 44px phone;
- horizontal/document overflow: false;
- runtime exceptions: none.

## Browser-discovered defect 2 — hidden optional rows shifted the composer into 1fr

A normal idle-state proof then found the desktop composer still consuming roughly 414–438px with no search results.

Computed grid evidence revealed the cause precisely: when optional status/history rows were hidden, normal grid auto-placement shifted later DOM children upward. The message feed moved into the former optional row, while the composer moved into the `1fr` reading row and absorbed spare height.

The workspace now assigns explicit grid rows:

1. header
2. controls
3. status
4. roster
5. older-history action
6. message feed
7. composer

Hidden optional elements can therefore collapse their own row to zero without changing the row ownership of later regions.

## Final live sizing

After the explicit-row fix, real Chrome measured:

- 1440px idle: feed 578px, composer 155px;
- 900px idle: feed 578px, composer 155px;
- 390px idle: feed 340px, composer 170px;
- 360px idle: feed 288px, composer 222px;
- 1440/900 active six-result search: feed 293px, composer 440px;
- 390/360 active search: feed 180px, composer about 439px;
- all measured states remained horizontally overflow-free;
- runtime exceptions: none.

The active-search expansion is deliberate task focus: returned source selection may occupy the bounded composer while a visible, scrollable feed remains available. Idle reading now gives the majority of the canvas back to Torah.

## Regression evidence

The final explicit-grid gate exited 0 and proved:

- Public Torah five-source selection contract: PASS;
- Public Torah source-link safety contract: PASS;
- social browser import closure: PASS;
- public history pagination: PASS;
- public history admission: PASS;
- browser older-history feed: PASS;
- Public Torah security: PASS;
- Public Torah presence: PASS;
- Public Torah persistence: PASS;
- targeted diff hygiene: PASS;
- `PUBLIC_TORAH_EXPLICIT_GRID_GATE=PASS`.

Existing Node module-type warnings remained warnings only; all contracts completed successfully.

## NEXT_ACTION

Move outward from the now-proven Public Torah centerpiece and measure the flagship shell itself across desktop and tablet widths: rail, workspace header, identity, search, special/list/thread panes, and whitespace hierarchy. Improve only the owners whose real geometry weakens comprehension or wastes meaningful study/social space.
