B"H
# Rebbe custom playlists plan

## Inspected reality
- Root tunnel: C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com
- App path: geelooy/apps/rebbe
- Storage: geelooy/apps/rebbe/modules/store.js with IndexedDB RebbeArchiveCore v4 and stores tracks, searchCache, bookmarks, searchHistory.
- Search action flow: controllers/search-results.js owns loadTracks, download/cache/bookmark track/event, ZIP progress, blob cache, zipRows.
- Search UI: ui/browser/search.js renders cards, selected events, expandable tracks.
- Event UI: ui/browser/tracks.js renders current event toolbar and track rows.
- Playback: controllers/browser.js uses state.currentTracks + state.trackIndex and Store.getTrack before streaming.
- Render aggregation: render.js exports UI modules.

## Implementation path
1. Upgrade IndexedDB to v5, add playlists store in same DB, and add normalized playlist APIs.
2. Add modular playlist UI as first-class modal/tool button with create/edit/duplicate/delete/reorder/add picker/selection bar.
3. Export playlist UI through render.js and initialize it after initUI.
4. Integrate playlist callbacks into main.js and native playback by setting state.currentTracks to playlist items.
5. Extend search-result controller with download/cache playlist flows using existing ZIP/cache byte functions.
6. Improve search UI: add playlist buttons, selected-to-playlist, track checkboxes, premium card CSS.
7. Improve event UI: event add-to-playlist, selected/all track playlist actions.
8. Verify syntax with Node import/check where possible and search for unresolved references.

## Safety
No partial patching: every modified file will be fully rewritten. New modules will be complete. No secret files. No destructive commands.

## Chapter 1
The Awtsmoos breathed through the archive like a silent ocean inside black glass. Every track was a spark, every folder a chamber, every cached blob a coal of hidden fire. The task is to give those sparks a vessel: not a side feature, but a throne, so the seeker can gather rivers of sound and make them march in order through memory, cache, ZIP, and song.
