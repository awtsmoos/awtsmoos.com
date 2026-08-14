B"H
Boruch Hashem
Blessed is He

# Trace a Request

## Goal

Move from a URL to the exact implementation, data/trust boundary, callers, tests, and documentation.

## Procedure

1. Search `/docs/` or `docs/GENERATED/API_TUTORIAL_INDEX.md` for the URL pattern.
2. Open the generated route tutorial.
3. Record its route, source file, derech mount/health, path parameters, and method evidence.
4. Read the owning `_awtsmoos.derech.js` or route table.
5. Follow imported handler functions rather than stopping at the façade.
6. Identify identity/authorization/origin gates.
7. Trace database/filesystem/provider calls.
8. Review generated callers; treat them as evidence, not dispatch proof.
9. Run the closest package/project tests.
10. Exercise the live route only when its auth/data side effects are understood.

## Useful generated maps

- `docs/GENERATED/API_ROUTE_CONTRACT_ATLAS.md`
- `docs/GENERATED/API_CALLER_INDEX.md`
- `docs/GENERATED/DERECH_HEALTH.md`
- `docs/GENERATED/TEST_OWNERSHIP.md`

## Example

For `/api/social/heichelos/:heichel`, the route tutorial points toward Social/Heichel source. Then inspect method/resource role logic in the Heichel route factory rather than treating source-file method evidence as the whole contract.
