B"H

# Post-write review

Original plan:
- Restore wheel scrolling across home, Heichel, and post reader surfaces.
- Stop modal initializeModal from crashing on undefined addEventListener.
- Disable post virtualization and eagerly render every verse at initial load.

Actually written:
- Added geelooy/style/awtsmoos-scroll-sovereignty.css.
- Rewrote geelooy/index.html to import the scroll sovereignty CSS.
- Rewrote both Heichel templates: geelooy/heichelos/_awtsmoos.heichel.html and geelooy/heichelos/heichel/_awtsmoos.heichel.html. The live route proved the deeper template is the one served for /heichelos/ikar, so the second pass repaired it too.
- Rewrote geelooy/heichelos/post/_awtsmoos.post.html to import the scroll CSS and cache-bump the reader script.
- Rewrote geelooy/heichelos/heichel/modules/modal.js with safe/idempotent bindings and no crash if optional nodes are absent.
- Rewrote geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js so the modal blueprint contains the refs modal.js expects.
- Rewrote geelooy/heichelos/post/logic/scribe.js so every section renders eagerly and the old virtual oracle is not imported.

Verification:
- node --check passed for modal.js, main-layout.js, and scribe.js.
- ReaderWheelBridge.test passed.
- scrollContract.test passed.
- Static search found eager-all-verses marker and no awakenVirtualScrollOracle/restoreScrollTarget references in scribe.js.
- inspectRuntime for /heichelos/ikar?view=series returned 200 and confirmed the live served HTML includes awtsmoos-scroll-sovereignty.css and app.js?v=modal-scroll-299.
- inspectRuntime for the post URL returned 200 and confirmed the live served HTML includes awtsmoos-scroll-sovereignty.css and postLogic.js?v=eager-verses-299.

Remaining uncertainty:
- A chromeEval attempt timed out with a 504 from the tunnel after Chrome launched. Browser process logs did not show the original initializeModal addEventListener crash; they only showed Chrome/Google background warnings.
