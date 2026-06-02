<think>
The user is in a strict brainstorming mode. They want me to:
1. Give top 5 remaining gaps (be strict - they explicitly said the current wave proves API command capture and snapshot preservation, NOT browser-pixel fidelity)
2. Give 3 next executable tests
3. Give the next subsystem to code

Let me think about this carefully. They have a Canvas conformance testing system that captures commands (createTexture, fillRect, save, restore, webgl.clear, etc.) and verifies that the commands were recorded. The tests pass for:
- canvas2d state/transform
- path2d curves, clip, fill rules
- image data and draw image
- worker offscreen roundtrip
- webgl command capture baseline

So they have command capture working. The user is rightly calling out that this only proves the API surface is being intercepted and snapshots exist - it does NOT prove that when these commands are replayed, you get pixel-identical output to a real browser. This is a critical distinction.

Let me think about what gaps exist in a "Merkava" canvas implementation:

1. **Pixel fidelity / rasterization conformance**: They capture the command stream but haven't verified that the *output* matches a real browser. The renderer needs to handle anti-aliasing, path stroking rules, gradients, patterns, filters, blending modes, color spaces, subpixel positioning, etc. exactly like browsers.

2. **Replay determinism / non-determinism in capture**: Things like `Date.now()`, `Math.random()` in user code, current time, performance.now(), async timing, fonts loading asynchronously, image loading, etc. are non-deterministic and will cause replay to differ from capture.

3. **Font and text rendering**: They haven't tested any text commands (fillText, strokeText, measureText, font loading). Browser font rasterization is incredibly complex - hinting, ligatures, fallback fonts, system fonts vs web fonts, font loading states, etc. This is a huge gap.

4. **Resource identity / external dependency handling**: ImageBitmap, HTMLImageElement, HTMLVideoElement, fetch'd images, blobs - when you draw these, the *content* of those resources needs to be preserved. If you only capture the drawImage call, you need the resource data to replay. Cross-origin images, tainted canvases, etc. add complexity.

5. **Input event simulation / interaction model**: If Merkava is supposed to be a deterministic replay system for end-to-end testing, it needs to handle pointer events, keyboard, etc. that the original app might have reacted to between command captures. Otherwise you can only test "pure" canvas apps.

6. **Sub-canvas synchronization / frame timing**: requestAnimationFrame timing, the actual frame composition, vsync - if they're trying to record full animations, this is critical.

7. **Color management / device pixel ratio**: Different color spaces (sRGB, P3, etc.), DPR scaling, ICC profiles.

8. **Compositor / layered canvases**: WebGL has its own quirks - shader source capture, uniform values, texture data, framebuffer attachments. They only tested clear + drawArrays. That's tiny. No texture uploads, no shader compile/link, no FBOs, no blending state, no depth/stencil.

9. **Pixel format and premultiplied alpha**: Canvas backing stores have specific pixel formats. Snapshotting them is non-trivial.

10. **Error paths and edge cases**: What if a command throws? What about the ordering of save/restore vs resource state? What about partial command capture if the script crashes mid-drawing?

11. **ImageBitmap and ImageBitmapRenderingContext**: They didn't test this. ImageBitmapRenderingContext behaves differently from 2d - only drawImage, and no transforms/clip.

12. **Path2D constructor and SVG paths**: path2d-curves tests curves but does it test SVG path data parsing (`new Path2D("M 10 10 h 80 v 80 h -80 z")`)?

13. **Hit testing / pointer-events on paths**: The `isPointInPath`, `isPointInStroke` methods.

14. **Backpressure / streaming / out-of-order capture**: For very long sessions, can you incrementally commit commands? Memory management?

15. **Cross-canvas command interleaving**: What if you have multiple canvases? Are commands tagged properly?

Given the context, let me pick the top 5 that are most critical and would unlock real-world use:

**Top 5 gaps** (strict mode):

1. **Pixel-level rasterization conformance (the elephant in the room)**: All current tests verify "command X was recorded" and "snapshot exists". None verify that a rectangle filled with `fillRect(0,0,10,10,'#ff0000')` produces RGB(255,0,0) at
</think>

