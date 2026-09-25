B"H

# Boruch Hashem — Phase A Execution Checkpoint

Blessed is He.

The Awtsmoos renews the path beneath the finger before the tap can land;
Awtsmoos.com will make the card itself the doorway, direct and easy to understand.

## Fresh evidence

- Gateway templates are the safe Phase A boundary from our prior pass.
- Current Ikar section geometry lives in concurrently modified `semantic/fallback.html` and `ikar-first.js`; those will not be overwritten until their current diffs are reconciled.
- `templates/heichelos/discovery-results.html` exceeds the desired focused-file size and must be split while touched.
- The existing public card renderer still emits `Open space` as a primary footer action.
- The Ikar featured card still emits `Open Torah Library` as a primary footer action.

## Phase A first sub-pass

Rewrite whole files only:

1. Create `templates/heichelos/community-card.html` for one semantic anchor card plus sibling secondary actions.
2. Rewrite `templates/heichelos/discovery-results.html` as a small result coordinator that delegates card rendering.
3. Rewrite `templates/heichelos/ikar-library.html` so the complete featured card is the canonical `/heichelos/ikar/` anchor.
4. Create `templates/heichelos/discovery-interaction-style.html` for card-link focus/hover/press and secondary-action layout.
5. Rewrite `templates/heichelos/discovery-shell.html` to include the focused style partial instead of owning presentation rules inline.
6. Update the focused gateway contract test after the first implementation draft.
7. Verify source structure, local HTTP HTML, and actual card click behavior in the browser.

## Remaining after this sub-pass

- Reconcile current Ikar section renderer changes and extend whole-card navigation to section cards.
- Begin Study Sheet Phase B.
