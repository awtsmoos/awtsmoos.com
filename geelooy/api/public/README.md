# B"H — Public DB File API (geelooy/api/public/)

An API to get files from the "public" folder in the DB, if the file exists.

## Contents
- `_awtsmoos.derech.js` — whole API: route `/`.
- `DOCUMENTATION.md` — auth and database context pointers.

## Endpoint
- `/` — serve a public-folder DB file addressed by the `path` query param.
  An `$_POST.authorized` check gates privileged access; public reads are
  distinguished from privileged mutation.
