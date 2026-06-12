B"H

# Android tunnel verification brainstorm

Question from user: are we sure it is all fixed on Android tunnel? The answer must be proven from the Android filesystem and runtime, not assumed from Windows.

Potential failure branches:
1. Android checkout may not contain the Windows edits at all.
2. Served route may use geelooy/heichelos/heichel/_awtsmoos.heichel.html, not geelooy/heichelos/_awtsmoos.heichel.html.
3. Post route may use geelooy/heichelos/post/_awtsmoos.post.html, not legacy geelooy/heichelos/_awtsmoos.post.html.
4. Scroll CSS may be missing, linked in wrong order, or not served.
5. Modal blueprint may still not include modalCancelBtn or modalContentTypeSelect.
6. modal.js may still call addEventListener on undefined.
7. scribe.js may still import awakenVirtualScrollOracle or only render target chunk.
8. Android command/runtime constraints may differ from desktop.
9. CSS rules may accidentally hide scroll in real mobile viewport even if desktop syntax passes.
10. There may be additional global CSS under nav/header or home/main that reintroduces overflow hidden after the scroll antidote.

Read plan:
- bulk read both Heichel templates, post template, scroll CSS, modal.js, main-layout.js, scribe.js, shell.css, home.css.
- grep for risky overflow hidden and modal refs.
- run node syntax and existing tests on Android.
- inspect HTTP response for live route HTML includes the right assets.

No modification unless Android proves missing/different. If modification is needed, rewrite entire files only.
