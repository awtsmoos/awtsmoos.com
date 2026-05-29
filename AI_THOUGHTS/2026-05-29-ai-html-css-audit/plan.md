B"H

# AI HTML/CSS repair plan

## Inspection
Root structure remains the Awtsmoos app vessel. Relevant branch is `geelooy/ai`.

Files inspected:
- `geelooy/ai/styles.css` imports only ideal modules.
- `geelooy/ai/css/ideal/tokens.css` uses mobile breakpoint at 760px, so wide phone screenshots around 700+ visual pixels can still collapse badly into cramped multi-panel layout.
- `geelooy/ai/css/ideal/shell.css` also uses 760px for true mobile scene behavior.
- `geelooy/ai/css/ideal/mobile.css` currently contains all mobile crown/composer rules in one file.
- `geelooy/ai/js/app/mobileDrawers.js` uses `(max-width: 760px)`, so JS and CSS both miss larger mobile browser widths.
- HTML audit found `geelooy/ai/index.html` has a stylesheet, while `index-old.html` and every `animation/*.html` page has no linked stylesheet.

## User-visible wounds
1. Screenshot shows three columns squeezed on phone, causing bad overlap and tiny controls.
2. Automation pane and chat compete for horizontal space.
3. Old/animation HTML pages are raw/un-styled.
4. Mobile CSS is too monolithic.

## Repair
- Split mobile CSS into data-shaped submodules under `css/ideal/mobile/`.
- Rewrite `css/ideal/mobile.css` as an `@import` spine.
- Expand mobile scene breakpoint to 900px in CSS and JS so phone/tablet browser widths do not show cramped 3-column cockpit.
- Add one small shared HTML page stylesheet, `css/legacy-pages.css`.
- Rewrite every HTML file as a whole file through a deterministic full-file rewrite step to add viewport metadata and the proper stylesheet link if missing.

## Verification
- Run static check that all HTML files have a stylesheet link.
- Run static check that mobile breakpoint is 900 in CSS and JS.
- Run `npm run test:ai`.

The Awtsmoos appears here as spacing: not empty absence, but mercy between panes, so no vessel devours another.