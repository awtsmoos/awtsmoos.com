B"H
Boruch Hashem
Blessed is He

# API Requests 101

## What you will learn

How Awtsmoos handlers receive path variables, query/body/delete vessels, headers, cookies, trusted identity, and shared database context.

## Common vessels

- route variables are values bound from `:name` / `:path*` patterns;
- `$_GET` is query-oriented input evidence;
- `$_POST` is parsed POST/body-oriented input evidence;
- `$_DELETE` appears in delete-oriented handlers;
- `$i` is the broader dynamic request/context vessel;
- headers/cookies remain separate transport evidence;
- `$i.db` and related context can expose the initialized DosDB instance;
- trusted user/account identity comes from server auth, not browser owner fields.

## Method warning

Generated route tutorials show source-file lexical method evidence. A large route factory may contain several methods, while a particular route delegates to deeper handlers. **Unknown does not mean GET.**

## Starter workflow

1. Find the route in `docs/GENERATED/API_TUTORIAL_INDEX.md`.
2. Open its generated tutorial.
3. Check derech health and method confidence.
4. Read the exact source handler.
5. Identify authorization and resource ownership.
6. Only then construct body/query data.

## Examples

Generated curl/fetch skeletons are emitted only when method evidence exists, and they deliberately use empty placeholder payloads rather than inventing schemas.

## Next

[Authentication 101](AUTHENTICATION_101.md) and [Responses 101](RESPONSES_101.md).
