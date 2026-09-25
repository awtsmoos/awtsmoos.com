B"H

# Boruch Hashem — Ikar Section UX Phase Three Final Execution Plan

Blessed is He.

The Awtsmoos needs no second doorway behind the first;
Awtsmoos.com should let every visible Torah card already be the path, compact in body and infinite in thirst.

## Final model

The live server proves Ikar root leads into `/heichelos/ikar/series/chassidus`. The next implementation therefore optimizes the real Chassidus nested browsing surface rather than generic hypothetical lists. Existing route/search semantics stay intact unless inspection proves otherwise.

## Final execution sequence

### Step 1 — inspect the real Chassidus surface

- Fetch `/heichelos/ikar/series/chassidus` from the live isolated server.
- Record link count, visible titles, headings, search markup, status copy, and stylesheet URLs.
- Identify the exact selector chain painting `.heichel-semantic-discovery` list items and anchors.
- Record git status/diff for those style files and semantic fallback files.

### Step 2 — choose the narrowest owner

Preferred decision tree:

1. If existing style owner is clean and focused: rewrite that complete file.
2. If existing owner is large/dirty/shared: create a new `ikar-section-list.css` focused stylesheet and import it last through the clean Ikar style spine.
3. Only alter fallback markup if CSS cannot provide the required full-card geometry or bidi safety.
4. Never add click handlers because real anchors already exist.

### Step 3 — card geometry contract

Every section row must satisfy:

- Entire visible card is one `<a href>` destination.
- `display:grid` or equivalent creates stable internal columns.
- Anchor width is 100% of the list item.
- Minimum touch block size is at least 44px.
- Title column uses `minmax(0,1fr)` and can wrap.
- No nested buttons or duplicate `Open` link.
- Focus ring is visible.
- Active state is subtle and does not reflow content.
- `li[hidden]` disappears completely during search filtering.

### Step 4 — density contract

Nested mobile route should target:

- Heading block compressed relative to root hero.
- Search/list gap roughly `.6rem–.9rem`.
- Card gap roughly `.45rem–.65rem`.
- Card padding roughly `.7rem–.95rem`.
- Title line-height approximately `1.3–1.45`, preserving Hebrew readability.
- Several section choices visible within an 800px viewport after header/search.
- No fixed heights and no clipping.

### Step 5 — bilingual contract

- Use logical properties only.
- Preserve Hebrew glyph line-height.
- Keep English metadata visually secondary when separable.
- If markup is one mixed-language string, use a CSS bidi strategy proven against the live text before structural markup changes.
- Test numerals, punctuation, and long Hebrew titles.

### Step 6 — focused tests after first code draft

Add a dedicated contract test checking:

- semantic fallback still emits discovery anchors;
- focused stylesheet is loaded for Ikar;
- anchor geometry uses full-width grid/flex rather than inline target;
- mobile media rules exist;
- hidden list items collapse;
- focus-visible state exists;
- all new/touched files remain <=120 lines;
- no JS click handlers were introduced.

### Step 7 — runtime verification

- HTTP 200 for root and Chassidus.
- Extract all nested hrefs after change and compare count/destinations.
- Confirm no disabled search decoy returns.
- Verify stylesheet route returns HTTP 200.
- Use browser navigation to Chassidus when browser adapter permits.
- Use live HTML/CSS evidence plus tests if screenshot/eval adapters remain flaky.

### Step 8 — post-write audit

- Read every touched file fully.
- Compare original plan vs actual implementation.
- Record any missing item before proceeding.
- Run Heichelos quality gate.
- Write a non-overwriting delta artifact.

## Files expected, subject to evidence

Likely new:

- `geelooy/style/heichelos/heichel/premium/ikar-section-list.css`
- `geelooy/heichelos/heichel/modules/test/ikarSectionListUxContract.test.mjs`

Likely import owner:

- the existing premium CSS index or Ikar stylesheet loaded by `_awtsmoos.heichel.html`.

Avoid unless inspection proves necessary:

- `geelooy/heichelos/heichel/semantic/fallback.html`
- `geelooy/heichelos/heichel/ikar-first.js`
- data/search APIs

## Final acceptance

The change is complete only if a learner can open Ikar, enter Chassidus, see multiple section choices quickly on a phone, tap anywhere on a section card, search without layout jumps, and navigate with keyboard or touch without a tiny-target hunt. The Awtsmoos is one before every division; the interface should reveal that unity by making each visible card already be its destination.
