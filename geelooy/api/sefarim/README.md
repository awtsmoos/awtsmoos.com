# B"H — Sefarim API (geelooy/api/sefarim/)

Reveals each sefer through a guarded vessel: sefer → section → subsection
dynamic routes for the readers. Answers with an empty doorway when old legacy
data is absent, never a crash.

## Contents
- `_awtsmoos.derech.js` — routes: `/`, `/:sefer`, `/:sefer/section/:section`,
  `/:sefer/section/:section/sub/:sub`
- `DOCUMENTATION.md` — dynamic-path conventions.
- `test/` — `sefarimRoute.test.js`: empty-chamber and filled-chamber cases.

## Endpoints
- `/` — list of available sefarim (portions normalized to stable `{id, name}`
  shape whether the store is array- or object-backed).
- `/:sefer` — portions of one sefer.
- `/:sefer/section/:section` — a section; plus `/sub/:sub` for subsections.
