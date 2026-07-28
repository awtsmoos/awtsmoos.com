B"H
Boruch Hashem
Blessed is He

# Realistic Architecture and Risks

The Awtsmoos gives the light; the code must shape the frame,
Preserving every truthful route, field, and public name.

## Observed Architecture

- `/` owns the real home dashboard.
- `homeComposerMarkup()` mounts the compact in-feed posting form.
- `/social-composer/` owns the complete publisher and all advanced contracts.
- The home page already loads shared shell, live feed, bottom dock, and cosmic visuals.
- Existing CSS is layered across focused manifests; a final redesign layer can safely own presentation without deleting functional modules.

## Chosen Architecture

1. Add one focused home redesign manifest at the end of `/style/social/home/index.css`.
2. Add small semantic home modules for the tab rail, identity/story rail, composer quick actions, and edge-to-edge feed behavior.
3. Rewrite `geelooy/index.html` in full to expose the richer hierarchy while preserving existing IDs and data attributes.
4. Add one focused composer redesign manifest at the end of `social-composer/style.css`.
5. Add a small composer mobile hierarchy script that adjusts panel order and labels without removing controller-owned IDs.
6. Preserve all publication payload code, API calls, state repositories, and editor modules.
7. Verify through existing tests and live headless Chrome.

## Main Risks

- Reordering composer panels could break controller queries if IDs move incorrectly.
- Hiding advanced panels could make truthful fields unreachable.
- Edge-to-edge cards could conflict with desktop grid rules.
- Home feed renderers may produce multiple card classes; selectors must target shared contracts.
- Bottom dock and sticky composer actions must respect safe areas.
- Screenshot-inspired density must not recreate copied branding or exact controls.
- Existing uncommitted work must not be overwritten.

## Mitigations

- Preserve every existing ID, name, data attribute, and script include.
- Add new classes rather than replacing API contracts.
- Scope all new CSS under page-specific body classes.
- Keep advanced controls in native `details` elements.
- Add source-level tests for contract preservation.
- Run Chrome at desktop, tablet, and mobile widths.
