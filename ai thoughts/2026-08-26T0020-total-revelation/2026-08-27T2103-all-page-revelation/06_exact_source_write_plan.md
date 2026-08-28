B"H
Boruch Hashem
Blessed is He

# Exact Source Write Plan — First Application Pass

The Awtsmoos reveals what truly needs a new vessel and what is already whole;
Awtsmoos.com improves by preserving living work while repairing the exact missing role.

## Source proven correct or peer-owned — do not rewrite in this pass

- Tunnel pressure/circuit/defer/preflight source currently matches `origin/main` and the installed `2eed3f7c...` runtime demonstrates the intended current+p90 lag behavior. Stability now needs deliberate regression/load proof, not cosmetic code churn.
- `fileServer.js`, `HtmlUiFoundation.js`, compact JS/CSS compiler files, and generated response negotiation are under active concurrent work. Preserve and reconcile later.
- `geelooy/heichelos/_awtsmoos.heichel.html`, `geelooy/social-hub/index.html`, and `geelooy/apps/docs/index.html` already contain sibling first-paint/semantic fallback work. Do not duplicate or overwrite it.
- `geelooy/style/geelooy-app/` and shared surface aggregators are under concurrent sitewide work. Reuse, do not compete.
- Audio Editor CSS is a 333-line monolith. A compliant improvement requires a later modular split; no quick partial patch.

## First owned source pass

### 1. New small progressive post renderer

Create one focused human-authored template/renderer partial under `geelooy/heichelos/post/` that consumes the template engine's `$$sd` payload.

Responsibilities:
- If `$$sd.post` is absent, return the existing loading partial unchanged for series/index routes that still lack server data.
- If server post data exists, render a semantic first-paint article with a real escaped title and useful readable body text before JavaScript starts.
- Never inject untrusted raw HTML into the server response without an existing sanitizer contract.
- Convert legacy HTML-ish string content to safe readable plaintext if no canonical sanitizer is available.
- Extract useful text from structured `dayuh` conservatively where possible; otherwise title + explicit enhancement/loading status is still better than an empty loader.
- Mark the server-rendered node so hydration may replace/enhance it without duplicate content.
- Remain small, tab-indented, documented, and under 120 lines.

### 2. Canonical public template

Whole-file rewrite:
`geelooy/heichelos/post/_awtsmoos.post.html`

Preserve every existing reader control, accessibility control, style/script import, mobile shell, sidebar, auto-scroll, command palette hook, theme, and current reduced font request.

Change only architectural first-paint concerns:
- use the new progressive post renderer inside `#realPost` instead of unconditional `loading.html`;
- keep UTF-8 canonical;
- add semantic/accessible first-paint status only where it does not duplicate the article;
- preserve current client hydration contract (`postLogic.js?v=reader-contract-007`) unless source evidence requires a version bump later.

### 3. Root compatibility template

Whole-file rewrite:
`geelooy/heichelos/_awtsmoos.post.html`

Preserve compatibility reader structure while:
- remove conflicting `ISO-8859-1` metadata;
- keep UTF-8 only;
- reduce the seven-family Google Fonts request to the smaller canonical reader set to reduce first-load cost;
- use the same progressive renderer so compatibility/direct template use is meaningful before hydration;
- keep the file under the current 120-line threshold.

## Explicitly deferred but required next

`geelooy/heichelos/_awtsmoos.derech.js` is 227 lines. Series-post routes currently pass IDs only, so they cannot server-render real post bodies. Do not add more responsibility to that file. In the next source pass, split route data-fetch/render responsibilities into small modules and whole-file rewrite the route gate so direct and series routes share the same server payload contract.

## Security invariant

Raw post HTML must not be trusted merely because the client previously inserted it. If no canonical server sanitizer is found, the first server render will be escaped plaintext/structured text. Rich client hydration can continue to use the existing established renderer after boot.

## Read/write protocol

Before each rewrite:
1. read the entire latest working file;
2. confirm it is still clean or reconcile any new sibling diff;
3. whole-file write only;
4. re-read the entire result.

After the complete first source pass only:
- syntax/template compilation checks;
- existing template/style contracts;
- direct-post SSR/no-JS regression;
- compatibility charset/font regression;
- browser normal + `?compact=true` functional verification;
- production MIME/body verification after integration/deploy.

NEXT_ACTION: finish sanitizer evidence, read the two templates completely from current disk, create the progressive renderer, rewrite both templates whole, and re-read all three files before tests.
