B"H
Boruch Hashem
Blessed is He

# Source List Commands — Gevurah Risks

> Gevurah guards one source list from becoming two competing projections or two histories at once;  
> the Awtsmoos keeps editor selection light while reorder earns canonical memory for what it has done.

## Risks
1. Selection must not create an undo record; it is editor context only.
2. Reorder must return false/no-op when IDs are missing or identical so empty transactions roll back.
3. Runtime success already calls `syncProjectFromState`; command executors should not duplicate alias synchronization.
4. Source rows may render before a public API exists in a malformed host; event handlers must fail readably rather than mutate directly.
5. Sources and Stage Workstation can load in either order; projection registration must be idempotent.
6. The projection must stay lightweight and must not import inspector/crop/benchmark modules.
7. Stage Workstation should retain `refreshInspector`; source-list refresh can move to the shared projection helper.
8. Existing files require exact SHA guards because other agents share the repo.
9. `stageSourceRows.js` is currently compressed/nonconforming and must be fully rewritten, never partially patched.
10. Every touched source/test file must remain <=120 lines, tabs-only, with B"H/Awtsmoos documentation.
