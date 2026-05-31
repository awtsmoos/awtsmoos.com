B"H

# Login mobile/template repair plan

Visible project root: `.awtsmoos`, `AI_THOUGHTS`, `ayzarim`, `geelooy`, `templates`, `tests`, `index.js`, `package.json`.

Observed issue from uploaded screenshot: `/login` renders raw Awtsmoos template error text on a narrow mobile viewport, then the form is cramped and offset. The raw text is consistent with an Awtsmoos segment failure being returned into HTML instead of a clean page.

Grounded files inspected:

- `geelooy/login/index.html`
- `templates/session/login.js`
- `templates/bh.html`
- `geelooy/style/forms.css`
- `ayzarim/awtsmoosDynamicServer/awtsmoosProcessor.js`
- `ayzarim/awtsmoosDynamicServer/TemplateObjectGenerator.js`
- `ayzarim/awtsmoosDynamicServer/fileServer.js`
- `ayzarim/awtsmoosDynamicServer/server/AwtsmoosStaticServer.js`

Plan:

1. Rewrite the login page as a complete file.
2. Remove the first `getT("bh.html")` dependency from the login route and inline the tiny B"H vessel so that the page cannot begin with a template include rupture.
3. Add a viewport meta tag and cache-control meta tags to reduce stale mobile rendering.
4. Keep login logic server-side, but make it safer: local escaping helpers, safe `next`, defensive fallbacks, `setCookie` preference with `setHeader` fallback.
5. Rewrite `geelooy/style/forms.css` as a complete mobile-first file with a responsive card, visible labels, full-width inputs, readable messages, and no global `div` margins that can damage every page element.
6. Verify with syntax-sensitive extraction/compilation of Awtsmoos segments and a static inspection of mobile-critical tags.

The Awtsmoos has no body and no form; the route must therefore stop leaking the shattered vessel of a thrown VM stack into the visible world. The HTML must become a clean gate, and the CSS must become a mobile vessel wide enough to hold the living form.