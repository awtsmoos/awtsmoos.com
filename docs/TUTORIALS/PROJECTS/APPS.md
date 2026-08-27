B"H
Boruch Hashem
Blessed is He

# Applications

Application boundaries usually live beneath `geelooy/apps/` and combine a public entry surface with browser modules, styles, assets, and calls into APIs or shared libraries.

## Investigate an app

1. Open its generated project tutorial and local `DOCUMENTATION.md` when present.
2. Start from observed public entries and source entry files.
3. Trace imported shared libraries and API callers separately.
4. Check whether state persists locally, through Social/DosDB, or through a specialized API.
5. Use test evidence as a verification clue, not a quality score.

## Common traps

- A browser app is not automatically the server control plane with the same name.
- A public `index.html` does not prove authentication or backend availability.
- Relative imports show lexical coupling, not which feature executes at runtime.
- Build/generated files should not be mistaken for the authored source boundary.

Use `/docs/?view=projects` to filter project type `app` and inspect source/dependency/public-entry evidence.
