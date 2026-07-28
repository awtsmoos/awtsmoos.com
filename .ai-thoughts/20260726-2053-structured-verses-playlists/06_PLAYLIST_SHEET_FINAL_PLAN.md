B"H
Boruch Hashem
Blessed is He

# Playlist Sheet Final Plan

## Files

1. `js/destination/PlaylistSheet.js`
	- Native dialog lifecycle, focus, navigation level, search, async detail loading.
2. `js/destination/PlaylistSheetView.js`
	- Safe text-only Heichel and series rows with selected checkmarks.
3. Rewrite `PlaylistSelector.js`
	- Replace inline choice expansion with sheet opening.
	- Preserve current summary, default action, and Browse all.
4. Rewrite `PlaylistChoiceView.js`
	- Keep writable selection utility; move row rendering to sheet view.
5. Rewrite `DestinationPanel.js`
	- Add non-mutating detail lookup and creation handoff methods.
6. Add `styles/redesign/structured/playlist-sheet.css`.
7. Rewrite `styles/redesign/structured/index.css` to load sheet styling.
8. Add focused tests for sheet contracts and selected-state behavior.

## Interaction Proof

- Open Change series.
- Confirm dialog modal state.
- Filter writable Heichelos by search.
- Open one Heichel without changing canonical state.
- View root and nested series rows.
- Confirm selected row checkmark.
- Choose a series and close.
- Reopen, use Back, use Escape, and confirm focus restoration.
- Trigger New series and confirm the existing creation panel is revealed and focused.
- Verify no mobile or desktop overflow.
