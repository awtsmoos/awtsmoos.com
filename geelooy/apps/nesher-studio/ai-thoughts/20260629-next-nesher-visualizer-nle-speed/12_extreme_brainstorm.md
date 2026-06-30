# B"H Extreme Brainstorm

The studio must stop feeling like a demo and start feeling like an editor.

Crop revelation:
- Add crop presets: 16:9 landscape, 9:16 vertical, 1:1 square, center safe, and clear crop.
- Crop overlay should show rule-of-thirds guides, glowing active crop frame, named handles, and dimmed discarded edges.
- Crop geometry should expose deterministic helpers so smoke tests can prove it without a real canvas.
- Inspector should speak crop state in human words.

NLE revelation:
- Render a real ruler with seconds ticks.
- Render a playhead line that can be moved by buttons.
- Render track headers with kind and clip count.
- Render selected clip cards with start/end/duration/fade/mute/disabled metadata.
- Add zoom in/out and jump start/end controls.
- Keep commands as tiny modules and tests as deterministic model-level proofs.

Navigation/button revelation:
- Add top command/nav strip: Stage, Sources, NLE, Benchmark.
- Add grouped button panels: Capture, Sources, Selected Source, NLE Edit, Playback/Zoom.
- Keep buttons readable, taller, non-clipped, with clear labels.
- Add navigation bindings that scroll panels into view if the browser supports it.

Architecture revelation:
- Split `dom.js` into domain maps.
- Split inspector into crop, transform, and meta helpers.
- Split overlay into bounds and crop overlay drawers.
- Split NLE rendering into view model and markup modules.
- Keep everything under 120 lines and make every file an obvious vessel.
