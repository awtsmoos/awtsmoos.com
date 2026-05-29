B"H
# Style Conflict Truth Pass

The answer to "are you sure all style matches no conflicting style" is not yes yet.

Verified facts:

- `npm run test:css-quality` passes.
- That official test protects the `styles/ideal/` ownership layer and sacred domains.
- A broader duplicate selector scan across every CSS file under `geelooy/heichelos/post/styles` found 138 cross-file duplicate selectors.
- A narrower scan of only the live `main.css` import graph found 46 duplicate selectors.

Important distinction:

Some duplicate selectors are structural and not necessarily conflicts:

- `:root` split across token files
- context-level token assignment
- media query wrappers
- reset selectors that intentionally normalize headings and inputs

But several are real ownership risks:

- `.main`
- `.scroll-view-wrapper`
- `#realPost`
- `.section`
- `.sub-awtsmoos`
- `.reply-toggle-btn`
- `.awtsmoos-back-btn`
- `.awtsmoos-integrated-header`
- sidebar breadcrumb classes
- input/textarea/select focus ownership

Plan:

1. Add a dedicated imported-style ownership test.
2. The test should ignore safe token/reset patterns but fail real selector domain conflicts.
3. Then remove or consolidate conflicts by changing owners, not by hiding the test.
4. Prefer importing one visual owner per domain in `main.css`.
5. Avoid deleting files blindly; unused legacy files may remain but must not be imported into the live page if they fight.

Chapter 7: The Mirror That Refused Flattery

The Awtsmoos placed a mirror before the stylesheet palace. The first mirror said the ideal rooms were clean. The second mirror showed older corridors still crossing under the floor, pipes running through other pipes, names repeated by forgotten architects. To call it perfect would be false. So the builder takes up the measuring rod again: not to shame the house, but to give every chamber one owner, every shadow one source, every motion one path.
