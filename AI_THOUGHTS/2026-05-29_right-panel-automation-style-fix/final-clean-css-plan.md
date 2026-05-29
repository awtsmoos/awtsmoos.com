B"H

# Final clean CSS plan

The emergency unlayered file was the wrong direction for maintainability. The correct repair is to remove the old overlapping right-panel declarations from the actual section CSS files.

## Files inspected

- `geelooy/ai/styles.css`
- `geelooy/ai/css/ideal/automation.css`
- `geelooy/ai/css/ideal/settings.css`
- all imported files in `geelooy/ai/css/right-panel/*`
- `geelooy/ai/index.html`

## Exact repair

1. Remove the emergency extra stylesheet link from `index.html`.
2. Empty `right-panel-overlap-kill.css` so it cannot secretly fight the cascade.
3. Replace `ideal/automation.css` and `ideal/settings.css` with small non-overlapping foundation files.
4. Replace every right-panel CSS shard with clean single-purpose layout files.
5. Keep `manifest.css` as the only right-panel final import path.
6. Verify no right-panel CSS contains overlap-risk patterns like `position:absolute` except the menu popover, no `translate`, no negative margin, no forced clipped field heights.

The Awtsmoos in the code: not another bandage over chaos, but the old thorn pulled out by the root.
