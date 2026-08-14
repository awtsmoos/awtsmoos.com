B"H
Boruch Hashem
Blessed is He

# HTTP Method Evidence

The Awtsmoos gives one path different actions, but a method must be proven before a caller may assume;
Awtsmoos.com therefore records method evidence conservatively, leaving `unknown` where source gives no safe room.

## What the generated contract index means

[../GENERATED/API_SOURCE_CONTRACTS.md](../GENERATED/API_SOURCE_CONTRACTS.md) scans production API source files for explicit comparisons against HTTP methods. A source row may list `GET`, `POST`, `PUT`, `DELETE`, or another verb only when the file contains lexical method-dispatch evidence.

A row marked `unknown` **does not mean GET**. It means the discovery pass did not find a reliable explicit comparison in that source file. The handler may infer behavior from request vessels, delegate to another function, accept multiple methods, or rely on runtime machinery that the lexical scanner cannot prove.

## Observed repository patterns

The continuation scan found explicit method checks in dozens of API files, especially throughout Social. GET and POST are common; PUT and DELETE also appear. PATCH did not appear in the explicit method-comparison scan performed for this pass.

## Why method cannot be inferred from `$_POST`

A handler reading `$_POST` is evidence that submitted/body data is available. It is not by itself proof that the route rejects GET, PUT, or another method. Likewise, a read from `$_GET` does not prove that only GET is accepted.

## How to determine a concrete endpoint's verb

1. Find the URL in [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md).
2. Open its source file.
3. Check [../GENERATED/API_SOURCE_CONTRACTS.md](../GENERATED/API_SOURCE_CONTRACTS.md) for file-level method evidence.
4. Read the exact route handler and delegated functions.
5. Search frontend callers in [../GENERATED/API_CALLER_INDEX.md](../GENERATED/API_CALLER_INDEX.md). A caller's method is supporting evidence, not server authority.
6. Check tests for method-specific negative cases.

## Route tables

Table-driven families such as OAuth, Wallet, YouTube, Streaming, Ohr HaGnuz, and Tunnel Control can delegate the actual method decision into imported route functions. The route-table key proves the URL; the imported handler remains the authority for allowed verbs.

## Documentation rule

Never write `GET /path` or `POST /path` in a human chapter unless the source or a verified contract establishes that verb. Prefer `route: /path` plus a link to method evidence when certainty is incomplete.
