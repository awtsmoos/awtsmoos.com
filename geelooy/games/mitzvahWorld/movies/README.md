# B"H — Mitzvah World Movie Maker

The Movie Maker directs the real Mitzvah World renderer, actors, houses, trees, doors, cameras, animations, subtitles, audio, and scene visibility from one JSON project.

## Entry routes

- `/games/mitzvahWorld/` opens the short launcher menu.
- `/games/mitzvahWorld/?mode=world` enters normal gameplay directly.
- `/games/mitzvahWorld/?mode=movie&movie=sample30` opens the included 30-second project.
- `movie=<base64url JSON>` opens an encoded project.
- `movieJson=<URL-encoded JSON>` opens raw JSON.
- `movieUrl=/path/project.json` fetches a project.
- `autoRender=1` starts rendering after the studio is ready.

## NLE tracks

`scene` applies labels, color grades, transitions, and object visibility maps.

`actor` targets `player` or `npc`. Clips support `move`, `pose`, `talk`, and `jump`, named animations, facing targets, positions, jump height, and easing.

`door` targets a real door definition id and interpolates its open amount from zero to one.

`camera` contains cinematic shots with eased position and target paths. Targets may be explicit points or live actors.

`dialogue` draws timed speaker subtitles and supplies speech text to post-production.

`audio` schedules score and event tones into the browser capture stream.

## Editing

The studio contains a track-based timeline, clip lanes, scrub playhead, preview, JSON editor, Apply JSON button, GET URL generator, and Render + Download button.

The JSON schema is `movie-project.schema.json`.

The complete example is `projects/chossid-journey-30s.json`.

## Browser output

The real tiny renderer draws the world into its WebGL canvas. `MovieOverlay` composites that frame into a deterministic output canvas with scene grading, title cards, shot labels, transitions, and subtitles.

`MovieRecorder` captures the output canvas with `MediaRecorder`, preferring VP8/Opus WebM. WebAudio is included when the browser allows the context to run.

## Final MP4

Run:

```bash
node geelooy/games/mitzvahWorld/movies/tools/finalizeMovie.mjs
```

The finalizer reads dialogue directly from the project JSON, creates speaker voices with macOS `say`, mixes them over browser audio, normalizes the movie to the requested duration and frame rate, and writes H.264/AAC MP4 plus an ffprobe JSON report.

## Included film

`chossid-journey-30s.mp4` is the accepted final movie.

It contains a chossid walking, running, speaking to another person, approaching and passing through the real main-house front door, running inside, jumping, and finishing under a rising crane camera.

Verified properties:

- 30.000 seconds
- 960 × 540
- 24 fps
- 720 H.264 frames
- AAC stereo at 48 kHz
- four spoken dialogue cues
- full video/audio decode without errors

The browser master, final MP4, poster, probe report, and sampled-frame evidence are retained in this folder.
