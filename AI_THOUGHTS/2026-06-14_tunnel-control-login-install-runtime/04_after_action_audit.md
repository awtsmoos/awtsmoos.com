B"H

After-action audit:

Original plan:
- Fix PAGE_META runtime import issue.
- Make install buttons show command lines instead of opening raw scripts.
- Preserve login detection flow by letting boot complete.

Actual files rewritten:
- geelooy/apps/tunnel-control/js/router/paneMeta.js
- geelooy/apps/tunnel-control/index.html
- geelooy/apps/tunnel-control/js/session/loginGate.js

Verification performed:
- Node imported paneMeta.js and confirmed PAGE_META.install and PANE_META.install exist.
- Node imported favorites.js and loginGate.js successfully.
- Grep found no href="/api/tunnel/install in index.html or loginGate.js.
- Touched files were read back fully.

Remaining work:
- Browser refresh should confirm the visual click/copy behavior in the actual mobile browser.
- Node warned package.json has no type=module; not directly part of this bug, but worth future cleanup.

The gate is no longer a raw script mouth. It is a lamp with the exact paste-line burning inside.
