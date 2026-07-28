B"H
Boruch Hashem
Blessed is He

# Final File Plan

The Awtsmoos reveals one orderly publication path:
choose the home, write the verse, open the subsection, and bind each medium to its exact chamber.

## Destination and Playlist Modules

1. `js/destination/DefaultDestinationMemory.js`
	- Read and write one bounded default `{heichelId, seriesId}` per alias.
	- Ignore malformed or cross-alias storage.
2. `js/destination/DefaultDestinationResolver.js`
	- Pure scoring and selection of owned writable Heichel evidence.
	- Prefer remembered accessible destination.
	- Fall back to owned writable root series only.
3. `js/destination/PlaylistSelector.js`
	- Render selected `Heichel › Series` as a compact playlist card.
	- Open the real destination panel.
	- Offer `Make default` for valid selections.
	- Show `Heichel Home` honestly for root.
4. Rewrite `DestinationPanel.js`.
	- Restore draft/URL context first.
	- Then remembered default.
	- Then owned writable root fallback.
	- Refresh playlist selector whenever destinations or selection change.
5. Rewrite `DestinationSelection.js`.
	- Notify the playlist selector after real series selection.
6. Rewrite `ComposerAssembly.js`.
	- Assemble and expose the playlist selector and memory.
7. Rewrite `index.html`.
	- Add a stable `playlistSelector` mount above the writing canvas.
	- Make Verses a primary visible builder instead of a hidden afterthought.

## Structured Verse and Media Modules

8. `js/media/MediaPicker.js`
	- Create explicit Image, Audio, Video, and File buttons.
	- Keep each picker scoped to root, verse, or subsection.
	- Feed the existing `actions.add(scope, files)` path.
9. Rewrite `MediaPanel.js`.
	- Render explicit picker actions first, then attachments and optional drop zone.
10. `js/editor/SectionSummary.js`
	- Build numbered verse/subsection summaries and compact badges.
11. Rewrite `SectionEditor.js`.
	- Use open collapsible cards.
	- Keep title, comments, move/remove, blocks, scoped media, and subsections.
	- Add large `+ Add verse` action.
12. Rewrite `SubsectionEditor.js`.
	- Use nested open cards with title, coordinate, removal, blocks, and scoped media.
	- Keep a clear `+ Add subsection` action inside each verse.

## Styling

13. Add `styles/redesign/structured/index.css`.
14. Add focused modules for playlist, section cards, scoped media actions, and mobile density.
15. Rewrite `styles/redesign/index.css` to load structured styles last.

## Verification

16. Add pure tests for destination memory and resolver priority.
17. Add source/DOM contract tests for verse, subsection, and scoped media controls.
18. Run existing composer, Games, profile, and CSS quality suites.
19. Run installed headless Chrome on an isolated project server.
20. Assert:
	- playlist card is visible,
	- default selection is applied only from owned writable evidence,
	- `+ Add verse` creates a verse card,
	- `+ Add subsection` creates a nested card,
	- every scope exposes Image, Audio, Video, and File controls,
	- payload still contains scoped assets,
	- no horizontal overflow exists on mobile or desktop.
