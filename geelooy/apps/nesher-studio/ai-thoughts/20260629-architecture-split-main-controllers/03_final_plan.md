# B"H — Final Plan Before Writing

The code pass will preserve behavior while moving ownership out of `main.js`. The app will still create the same state, bind the same buttons, render the same NLE panel, start the same recording flow, and run the same generic HLS controller.

Safety rules:

- No partial patches.
- Every touched code file is written as a complete file.
- New files stay small and readable.
- The boot module owns orchestration only; leaf modules own feature binding.
- Runtime streaming state becomes private inside `genericHlsController.js`.
- Tests and parse checks run after writing.

The revelation: `main.js` stops pretending to be the whole bird. It becomes the call of the eagle; the wings are revealed as separate modules.
