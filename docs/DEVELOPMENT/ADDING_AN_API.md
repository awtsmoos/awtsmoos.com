B"H
Boruch Hashem
Blessed is He

# Adding or Changing an HTTP API

The Awtsmoos lets a request enter a derech, while Awtsmoos.com must keep path, method, input, authority, side effect, response, caller, and test visible together.

## Before adding a route

Find the owning API family and read its `_awtsmoos.derech.js`, local `DOCUMENTATION.md`, family manual and nearby route modules. Search the generated route and caller indexes to avoid creating duplicate or near-duplicate contracts.

## Contract checklist

- Public path pattern and dynamic `:name` variables.
- Accepted HTTP methods, explicitly enforced when required.
- Query/body/delete input vessels and validation.
- Authentication source: session, API key, OAuth or intentionally public.
- Resource authorization/ownership beyond login.
- Database paths or external-provider side effects.
- HTTP status/error behavior.
- Response content type: JSON, file, binary, stream or upgrade.
- Existing and new callers.
- Positive and negative tests.

## Dollar-variable rule

URL parameters use colon syntax. `$i`, `$_GET`, `$_POST`, `$_DELETE` and related names are server request/context vessels; never document them as URL path grammar.

## Documentation steps

1. Update the human API-family guide when semantics change.
2. Add or update examples only when source proves method/body/auth requirements.
3. Regenerate route, contract, caller and health indexes.
4. Confirm `API_ROUTE_CONTRACT_ATLAS.md` points to the correct source.
5. If lexical method evidence remains `unknown`, do not rewrite it as GET merely for prettier documentation.

## Security

For privileged or mutating APIs, include unauthenticated, wrong-owner, wrong-scope and malformed-input tests. Client-submitted owner/user fields must never silently become trusted identity.
