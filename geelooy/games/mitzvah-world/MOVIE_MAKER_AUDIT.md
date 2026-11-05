# B"H — Mitzvah World Movie Maker Audit

## Recovered systems

The repository did not contain an older Mitzvah World movie maker, but it did contain the two required foundations.

`geelooy/apps/animator` supplied NLE track, camera-shot, scene, performance, and export architecture.

`geelooy/apps/piano` supplied ordered browser recording, audio-stream, worker, finalization, and download patterns.

The new system adapts those ideas to the real Mitzvah World runtime rather than creating a disconnected renderer.

## Launcher

The game no longer boots invisibly underneath its opening screen.

The short main menu offers:

- Enter World
- Movie Maker

`mode=world` bypasses the menu for normal gameplay.

Movie GET parameters bypass the menu and open the studio.

## Runtime architecture

```text
createEretz3DDemo
  -> MitzvahWorldLauncher
    -> MainMenu
    -> createEretzRuntime(startLoop=true) for gameplay
    -> createMovieStudio
      -> createEretzRuntime(startLoop=false)
      -> MovieTimeline
      -> MovieActorDirector
      -> MovieCameraDirector
      -> MovieDoorDirector
      -> MovieSceneDirector
      -> MovieOverlay
      -> MovieRecorder
      -> MovieAudioEngine
```

## AI project contract

Projects may arrive through encoded GET JSON, raw GET JSON, fetched JSON, pasted editor JSON, or the included sample.

Tracks support scene changes and visibility, actor motion and animation, door motion, eased cinematic cameras, dialogue, and audio.

The complete machine-readable contract is `movies/movie-project.schema.json`.

## NLE

The visible studio provides track lanes, colored clips, ruler, scrub playhead, live preview, JSON editor, Apply JSON, GET URL generation, play/stop, render progress, and browser download.

The source WebGL canvas remains active but hidden. The output canvas composites real world frames with scene grades, transitions, titles, camera-shot names, and dialogue subtitles.

## Thirty-second film

Project: `movies/projects/chossid-journey-30s.json`.

The film uses seven tracks and thirty-three clips.

The chossid walks, runs, speaks with another character, approaches the real main-house door, passes through it after it opens, runs inside, jumps, and completes the journey.

Eight camera shots include establishing, side tracking, two-shot, low-angle hero, doorway follow, interior tracking, jump low angle, and crane ending.

## Floor correction

The first rendered candidate was rejected after evidence showed the general collision ground sampler was striking the house roof overhang.

Movie actors now use terrain height outdoors and explicit rotated-house floor metadata indoors.

Verified heights:

- outdoor approach: approximately 0.52 m
- interior floor: approximately 0.77 m
- interior jump apex: approximately 3.02 m
- grounded interior ending: approximately 0.77 m

The rejected evidence was deleted and the entire movie was rerendered.

## Final media

Accepted final: `movies/chossid-journey-30s.mp4`.

Browser master: `movies/chossid-journey-30s-browser-master.webm`.

Poster: `movies/chossid-journey-30s-poster.jpg`.

Final format:

- H.264 video
- 960 × 540
- 24 fps
- 720 frames
- 30.000 seconds
- AAC stereo
- 48 kHz
- 13,794,089 bytes
- SHA-256 `0eb45182641022bfc51d17030aafc341dd8c55be1d7c36e867671ebaab2e9c8a`

Full video and audio decode completed without errors.

Audio measures approximately −23.0 dB mean and −2.1 dB peak.

## Regression proof

Movie project and floor-resolver tests pass.

The original forest still contains fifty-four trees and all thirty-six presets.

The prior geometry suite still reports five houses, fourteen doors and mezuzahs, four staircases, zero stair penetrations, and zero road gaps or intersections.

## Honest limitations

Browser live WebAudio depends on trusted playback permissions. The accepted render obtained a running live audio context, and the finalizer always adds timed spoken dialogue from the same JSON before MP4 verification.

The NLE is JSON-first: clips can be scrubbed and projects rebuilt, but drag-resize editing is not yet implemented.
