<!-- B"H -->
# Awtsmoos Music Player

A clean, vivid, professional music player that plays your own audio, from your own device, in your own browser.

## What it does

- **Open a whole folder** from your device (File System Access API, `showDirectoryPicker`, recursive scan). Every audio file inside is listed: mp3, wav, ogg, m4a, aac, flac, opus, webm, aif, mp4 audio.
- **Add files** with a plain file input (a real `<label>` for it, so the tap opens the picker natively on every phone browser, old or new). Files are stored in the browser, so they play after a reload with no permission prompt.
- **Library list** with title, artist (parsed from `Artist - Title` file names), duration, size, and file date.
- **Sort** by name A–Z / Z–A, newest / oldest added, newest / oldest file, longest / shortest.
- **Search** by title, artist, or file name.
- **Playlists** — create, open, delete; add any song from its row menu. Saved in IndexedDB.
- **Persistence** — tracks, playlists, and folder handles live in IndexedDB (`awtsmoos-music`). File handles are re-authorized on return with a Reconnect button; browsers without the File System Access API fall back to storing the files themselves.
- **Background playback** — one `<audio>` element plus the Media Session API, so playback continues when the tab is hidden, the screen locks, or you switch apps, with lock-screen and headset controls.
- **Transport** — play/pause, previous/next, shuffle, repeat off/all/one, seek, volume, playback speed.
- **Live visualizer** — the playing audio drives glowing bars on the hero canvas (Web Audio analyser), with a soft idle shimmer when paused.
- **Retractable UI** — the Library panel (left) and Up Next queue (right) collapse away; the bottom mini-player docks the current song and expands back to the full player. Fully responsive down to phone width.

## Files

- `index.html` — layout
- `style.css` — vivid dark glass theme, no images (all glow is CSS + canvas)
- `js/db.js` — IndexedDB wrapper (tracks, playlists, meta)
- `js/library.js` — folder/file picking, drag-and-drop, metadata probing
- `js/player.js` — queue, transport, Media Session
- `js/visualizer.js` — Web Audio analyser + canvas
- `js/app.js` — wiring, rendering, playlists, sorting

## Privacy

Nothing is uploaded. Files stay on the device; only names, dates, and playlists are kept in this browser's IndexedDB. Folder access is read-only and re-asks permission when the browser requires it.
