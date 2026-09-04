B"H
Boruch Hashem
Blessed is He

# Massive Improvement Wave 2 — Gevurah Risk Attack

> Gevurah asks where a beautiful refactor can still corrupt a living stream or publish a false URL in the night;  
> the Awtsmoos keeps every boundary honest, and Awtsmoos.com lets evidence—not excitement—decide what is right.

## Critical Risks
1. JSON cloning may throw on circular DOM/media handles before Undo even starts.
2. Stripping `node`/`stream` globally could erase unrelated extension data with the same keys.
3. Reattaching resources by array index would corrupt identity after reorder.
4. Removing a source and immediately stopping its stream would make Undo semantically false.
5. Keeping every stream forever would leak resources after history eviction.
6. Shared nodes/streams between duplicated sources require reference-aware disposal.
7. Object URL revocation is irreversible and must wait for true unreachability.
8. History rollback and Undo/Redo use different execution seams and both need reattachment.
9. Source lifecycle commands can accidentally create duplicate history entries if legacy helpers still call `changed()`.
10. Stage drag can pollute history if editor-only selection is treated as canonical state.
11. HTML5 drag/drop can leave mobile without a usable layer-order control.
12. Lazy feature reinitialization can double-bind listeners across boot recreation.
13. A local test server is not a deployed link; public preview and permanent deployment must be labeled accurately.
14. Existing public routes may point at stale code; version/hash evidence is required.
15. Editing generated HTML to satisfy line limits would create false source-of-truth debt.
16. App-local package metadata must not shadow dependencies/scripts unexpectedly.
17. Browser proof in another agent's Chrome profile is contaminated evidence.
18. Tests can pass while optional resources load eagerly; resource timing must be checked.
19. Tests can pass while mobile overflows; real viewport geometry must be checked.
20. Git workspace is concurrently dirty; every existing rewrite needs a refreshed hash guard.
