B"H

# Specific Fix Plan: Breadcrumb HTML Injection Bug

Audit finding:

`js/features/pathCrumbs.js` has a broken `safeHtml()` function:

- `<` is replaced with `<`, not `&lt;`.
- `>` is replaced with `>`, not `&gt;`.
- The module renders paths through `container.innerHTML`.

Because file/folder names can contain characters that look like HTML, this is a concrete bug.

Target file:

- `geelooy/apps/tunnel-control/js/features/pathCrumbs.js`

Exact rewrite goals:

1. Remove `safeHtml()` entirely.
2. Replace `innerHTML` with `replaceChildren()`.
3. Build separators and buttons with `document.createElement`.
4. Store path in `button.dataset.path` by assignment, not string interpolation.
5. Bind click handlers directly.
6. Preserve relative and absolute breadcrumb behavior.
7. Run `node --check` and DOM safety scan.
