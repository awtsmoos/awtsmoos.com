B"H

# Phase Two — Architecture Critique

The Awtsmoos renews Chesed and Gevurah together: expansion without boundary becomes flood, boundary without usefulness becomes night;
Awtsmoos.com should therefore make API power deeper behind a smaller, clearer covenant of light.

## Rejected architecture: one universal API service

A single facade for social, mail, Heichelos, wallet, runtime, media, and admin would look simple briefly but create authorization coupling, giant test surfaces, and hidden domain assumptions.

## Rejected architecture: normalize every legacy payload now

Mass migration would break clients and erase domain semantics. Response consistency should begin as documented conventions and adapters, then migrate intentionally per family.

## Selected architecture: federated domain vessels

- root API catalog documents families and shared conventions;
- each family exposes a small facade;
- facades delegate to services/policies/repositories;
- browser gateways mirror domain methods rather than HTTP/socket mechanics;
- shared base classes exist only for genuine common transport or validation behavior;
- compatibility remains explicit rather than accidental.

## Immediate second-pass social fixes

- collapse duplicate `RoomMembershipControls` logic into member-list, invitation, and departure collaborators;
- split privacy into request-policy, block, and lazy-loading composition vessels;
- preserve native retractable room governance;
- finish deterministic tests for capability derivation and canonical read-watermark payload.

## API-wide safeguards

1. Do not move database paths casually.
2. Keep alias authorization distinct from authentication.
3. Never invent shared errors that erase useful domain detail.
4. Never let UI call transport directly when a domain gateway exists.
5. Prefer data manifests for discovery over giant switch statements.
6. Preserve compatibility until a migration has evidence, tests, and docs.
7. Keep route facades tiny and independently loadable.
8. Make mutation and pagination contracts explicit.
9. Treat generated docs as outputs, not hand-authored source.
10. Improve family by family while the root explains the whole graph.
