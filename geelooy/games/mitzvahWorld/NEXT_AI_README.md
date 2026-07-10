# B"H — Next AI: Mitzvah World was simplified

This directory now intentionally contains only the new raw **Awtsmoos** page and the modules reachable from it.

## Default page
- Use: `/games/mitzvahWorld/index.html`
- Source file: `geelooy/games/mitzvahWorld/index.html`
- Entry module: `experiments/Awtsmoos/src/app/createEretz3DDemo.js`

## Naming correction
The name is **Awtsmoos**. Do not add extra suffixes, lowercase variants, or abbreviated runtime filenames here.
The current new runtime directory is:

`geelooy/games/mitzvahWorld/experiments/Awtsmoos`

The browser runtime global is:

`window.Awtsmoos`

## Where the old code went
The full previous Mitzvah World directory was moved outside the repo to:

`/Users/awtsmoos/Documents/mitzvahWorld_old_archive_20260709-193844`

It is also recoverable from git history because the old repo files were tracked before this cleanup.

## External dependency still used
The new page still imports the existing procedural primitives from:

`geelooy/libs/awtsmoos-procedural/src/mesh/primitives/`

That package path predates this cleanup and was not renamed in this narrow pass.
Do not re-import the old THREE.js Mitzvah World stack unless the user explicitly asks.
