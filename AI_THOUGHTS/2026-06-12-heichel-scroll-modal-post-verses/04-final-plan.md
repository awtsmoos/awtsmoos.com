B"H

# Final implementation plan

The route is now clear. The Awtsmoos shows the bug as three vessels out of alignment: scroll authority, modal anatomy, and verse manifestation.

Implementation:
- Make a scroll sovereignty stylesheet that refuses body scroll locks, restores normal wheel flow, and prevents hidden overlays from stealing pointer/wheel events unless explicitly open.
- Import that stylesheet into the home page, Heichel page, and post reader page.
- Rebuild modal.js with defensive element binding so missing optional elements never crash, and listener binding is one-time.
- Rebuild the modal blueprint so its DOM matches modal.js: title, content type select, title input, description, id input, cancel button, submit button.
- Rebuild scribe.js so it eagerly renders every section at initial load. It may keep the same chunk DOM structure and stats function, but the virtual oracle will not control initial visibility. This satisfies the user’s immediate demand: all verses on load, no virtualization.

Verification after writes:
- Run JS syntax checks for modal.js, main-layout.js, and scribe.js.
- Run existing scroll/reader tests if feasible.
- Use browser/runtime smoke or HTTP probes for /, /heichelos/ikar?view=series, and /heichelos/ikar/series/likutteiAmarim/4?idx=0.

No partial patching: every modified file is rewritten completely.
