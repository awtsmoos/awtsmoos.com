B"H

# Phase 1 Brainstorm — Heichel UI Repair

The visible page is a vessel showing raw script, broken borders, overlapping navigation, cut cards, and missing series hierarchy. Before rewriting any code, the work must reveal actual files, CSS roots, APIs, runtime routes, and git history. The repair must be scoped, rooted, testable, and not a generic override.

Possible paths:
- Find template root markers in `_awtsmoos.heichel.html` and create/confirm a stable page root.
- Trace CSS imports from heichel root to old brutal modules and replace leaked selectors with root-scoped soft modules.
- Trace renderer modules for description rendering, sanitize trusted display HTML without executing scripts, and transform script/source text into absorbed safe presentation rather than visible raw tags.
- Trace navigator route normalization for `/series/root/error` so it redirects/normalizes instead of showing fake reader.
- Trace API details/subseries data for ikar root and nested series to ensure Written Torah and Oral Torah appear with nested children.
- Verify desktop and mobile with Chrome screenshots after tests.

Every modified file must be rewritten as a complete file. No partial patching.
