B"H
Boruch Hashem
Blessed is He

# API Projects

API project boundaries generally live under `geelooy/api/`, but URL ownership is determined by derech discovery and route tables rather than directory names alone.

## Investigate an API project

1. Open the project tutorial for source/dependency shape.
2. Open the API-family manual and generated route tutorials for HTTP behavior.
3. Read the owning `_awtsmoos.derech.js` and imported handlers.
4. Separate trusted identity, resource authorization, persistence, provider calls, and response semantics.
5. Verify through callers/tests/runtime where safe.

## Why project and route evidence differ

A project packet answers “what files/dependencies/entries surround this subsystem?” A route tutorial answers “what source evidence belongs to this URL pattern?” One project can own many routes, and directory ownership does not prove request reachability.

Never infer GET from unknown method evidence or anonymous access from an `/api/` path.
