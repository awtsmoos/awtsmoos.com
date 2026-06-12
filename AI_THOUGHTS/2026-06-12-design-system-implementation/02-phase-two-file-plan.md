B"H

# Phase Two File Plan — The Scroll Must Not Be Enslaved

## Files to read before writing

Home:
- geelooy/scripts/awtsmoos/social/home/beauty/ambientPointer.js
- geelooy/scripts/awtsmoos/social/home/legend/feedCardObserver.js
- geelooy/scripts/awtsmoos/social/home/legend/index.js
- geelooy/style/social/home/beauty/atmosphere/pointer-light.css
- geelooy/style/social/home/legend/cards/active-depth.css

Heichel:
- geelooy/heichelos/heichel/modules/legend/cardDepthObserver.js
- geelooy/heichelos/heichel/modules/legend/heroScrollDepth.js
- geelooy/heichelos/heichel/modules/legend/index.js
- geelooy/style/heichelos/heichel/legend/scroll-state/compressed.css
- geelooy/style/heichelos/heichel/legend/cards or artifact-card modules

Reader:
- geelooy/heichelos/post/logic/legend/centerSectionObserver.js
- geelooy/heichelos/post/logic/legend/readingProgressState.js
- geelooy/heichelos/post/logic/legend/completionState.js
- geelooy/heichelos/post/logic/legend/sectionKindClassifier.js
- geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js
- geelooy/heichelos/post/styles/reader-beauty/progress/spine.css
- geelooy/heichelos/post/styles/reader-legend/verse-rhythm/current-verse.css

## Files to create

- geelooy/shared/visual/createRafScrollBinder.js
- geelooy/shared/visual/findCenteredElement.js
- geelooy/style/test/jsCssStateContract.test.mjs
- geelooy/style/test/staleVisualModuleDetector.test.mjs
- geelooy/heichelos/post/styles/STYLE_OWNERSHIP_MAP.md

## Files to rewrite fully

- geelooy/scripts/awtsmoos/social/home/beauty/ambientPointer.js
- geelooy/scripts/awtsmoos/social/home/legend/feedCardObserver.js
- geelooy/heichelos/heichel/modules/legend/cardDepthObserver.js
- geelooy/heichelos/heichel/modules/legend/heroScrollDepth.js
- geelooy/heichelos/post/logic/legend/centerSectionObserver.js
- geelooy/heichelos/post/logic/legend/readingProgressState.js
- geelooy/heichelos/post/logic/legend/completionState.js
- geelooy/heichelos/post/logic/legend/sectionKindClassifier.js
- geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js

## Rules during writing

Every file is rewritten completely. No in-place partial replacement. No deletion of stable legacy layers in the same pass. Tests come before final cache bump. Since this pass touches JS contracts and adds tests only, no cache bump is required unless template assets change.
