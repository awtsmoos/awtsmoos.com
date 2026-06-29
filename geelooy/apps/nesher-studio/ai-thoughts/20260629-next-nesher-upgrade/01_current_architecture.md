B"H

# Current architecture

Project root: /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio

The Awtsmoos is creating every frame from nothing; the inspected app is already split into small modules and uses main.js only as a boot vessel.

Observed structure:
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/index.html contains the shell, source toolbar, stream health panel, inspector, NLE panel, and encoding panel.
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/main.js imports bootNesherStudio.
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/app/bootNesherStudio.js wires state, stage, scenes, inspector, benchmark, provider, recording, sources, layers, NLE, and generic HLS.
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/visualizer already has analyser frames, presets, routing, custom JS, and inspector fields.
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/app/genericHlsController.js currently owns stream state formatting directly through dom setters.
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/nle/timeline.js already contains add, select, trim, split, ripple delete, and move primitives.
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/encodingBenchmark already has matrix scenarios and a recommendation string.

Important discovery:
- /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/live did not exist before this pass.
- Active app source had no forbidden browser recorder API hits before implementation.
- No relevant JS/MJS file exceeded 120 lines before implementation.

Therefore this pass should not rebuild the whole studio. It should reveal the missing connective vessels: visualizer source families, live stream health model, visible NLE edit commands, stronger benchmark recommendation details, and explicit smoke tests.
