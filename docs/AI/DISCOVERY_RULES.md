B"H
Boruch Hashem
Blessed is He

# AI Discovery Rules

The Awtsmoos is not reduced to an index; Awtsmoos.com uses indexes only as vessels that lead the reader back to source, behavior, and human intent.

## Start from the user’s question

If the user names a URL, begin with the public-entry or route atlas. If they name a source file, begin with source-to-doc and project records. If they name a feature, begin with human project/system guides. If they name a test, configuration variable, dependency, or WebSocket message, begin with the matching generated index.

## Prefer canonical roots

The main public root is `geelooy/`. Server/runtime infrastructure is primarily `ayzarim/`. Root symlink aliases must not be described as duplicate implementations. Nested `awtsmoos.com/` must not be assumed canonical without runtime/deployment evidence.

## Interpret generated evidence conservatively

A symbol name proves only that the lexical scanner found it. An import edge proves source-level reference, not that the code runs in every environment. A browser API literal proves a caller string exists, not that the server contract is healthy. A syntax-clean derech proves parsing, not authentication, provider availability, data correctness or successful execution.

## Use the project record

Per-project JSON records include path, type, title when observed, entry files, local documentation, symlink target, file-category counts and symbol summaries. They intentionally omit secrets, inferred ownership claims and giant raw file lists.

## Escalation sequence

1. Human documentation.
2. Generated project/route/entry/dependency index.
3. Local `DOCUMENTATION.md`.
4. Source file and direct dependencies.
5. Relevant tests/runtime traces.
6. Only then state behavior as verified.

## When documentation is missing

Use `docs/GENERATED/MISSING_DOCUMENTATION.md` to see mechanically discovered gaps. If the directory is a meaningful product/runtime/data boundary, add a manual guide. If it is evidence, generated output, a symlink alias or a tiny implementation detail, do not manufacture a fake project manual merely to make coverage appear perfect.

## Updating AI-facing data

Never hand-edit generated project JSON. Change source/manual docs or generator logic, then regenerate. The machine manifest is a discovery surface, not a place to encode hidden business logic.
