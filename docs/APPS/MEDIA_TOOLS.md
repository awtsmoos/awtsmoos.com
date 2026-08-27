B"H
Boruch Hashem
Blessed is He

# Media Tools

The Awtsmoos lets voice, image, caption, video, and stream take form in time;
Awtsmoos.com gathers media tools here while provider APIs keep their own contract line.

## Browser-level media surfaces outside `apps/`

- `geelooy/ayin/` — “Real Awtsmoos Recorder.”
- `geelooy/record/` — camera preview/recording surface.
- `geelooy/recorder/` — “Local Recorder.”
- `geelooy/youtube/` — Awtsmoos YouTube Manager.

## Audio Editor — `geelooy/apps/audio-editor/`

Focused professional-audio editing UI.

## Video Editor — `geelooy/apps/video-editor/`

Focused video editing UI.

## Captions — `geelooy/apps/captions/`

A sizable caption-oriented application, currently titled “Ein Sof Engine [Quantum Core v2.5]”.

## Transcribe — `geelooy/apps/transcribe/`

Focused transcription tool.

## Lyric Sync — `geelooy/apps/lyric-sync/`

Lyric/timing synchronization tool.

## Broadcaster — `geelooy/apps/broadcaster/`

Broadcast/stream-oriented client; inspect connector usage when changing provider behavior.

## PDF and image utilities

`pdf-to-img` and `watermark-remover` are focused conversion/image utilities.

## Related APIs

- `/api/youtube/*` — auth/channel/video/upload/live management.
- `/api/streaming/*` — connector/action dispatch for streaming providers.
- `/api/fetch/*` — guarded remote fetch where media tools need server-side retrieval.

Provider credentials and upload/stream state are backend-sensitive; do not encode them into static documentation or client source.
