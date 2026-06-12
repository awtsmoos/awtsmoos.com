B"H

# Specific Fix Plan: Status Summary DOM Safety

Audit finding:

`js/features/status.js` builds identity/device summary cards with `innerHTML` and unescaped values such as user id, tunnel name, root path, and agent version. These values come from API/device responses and should be rendered as text nodes.

Target file:

- `geelooy/apps/tunnel-control/js/features/status.js`

Exact rewrite goals:

1. Import `h` from `../ui/core/html.js`.
2. Replace `renderIdentityNice()` string HTML with DOM node builders.
3. Replace device summary `innerHTML` with `replaceChildren(cardNode)`.
4. Preserve all existing behavior:
   - status pills
   - mini login/agent labels
   - user chip visibility
   - tunnel name discovery
   - live config loading
   - JSON debug boxes
5. Guard optional DOM nodes more consistently.
6. Re-run `node --check` for status.js.
7. Re-run DOM safety scan to confirm status.js has no `innerHTML`.
