B"H

# Merkava Runtime + Code Preview Work Log

## Chapter 1: The Gate That Mistook a Map for Fire

The Awtsmoos revealed two runtime cracks:

1. Inline `<script type="importmap">` was being collected as JavaScript and sent into `new Function`, producing `Unexpected token ':'`.
2. Inline HTML supplied with a folder-like `p` value was keyed under that raw path, so Merkava treated the HTML document as JavaScript and produced `Unexpected token '<'`.

## Plan

- Split `runtimeVirtualEnv.js` into small CommonJS helpers.
- Teach preflight to execute-check only JavaScript-like inline scripts.
- Preserve real JavaScript syntax detection.
- Give inline HTML a `.html` entry, usually `<p>/index.html`, so Merkava boots it as a document.
- Improve `apps/code` browser preview into a virtual preview chamber: URL bar, custom HTML, custom JavaScript, iframe, console.
- Verify syntax and runtime behavior with local Node/Merkava stress commands.

## Verified

- Node syntax checks passed for runtime helper modules.
- Import map HTML inline case returns `ok: true` through local Merkava simulation.
- JSON script skip case returns `ok: true`.
- Real broken JavaScript still fails in preflight as expected.
- Browser runtime ESM files pass `node --check`.
- Browser CSS includes the new virtual preview classes.

## Note

The live tunnel action process may continue using its installed agent copy until the agent is refreshed/reinstalled. The repo implementation under `geelooy/apps/tunnel` is verified directly from the working tree.
