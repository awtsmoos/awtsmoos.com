B"H

# Wave A Test Delta — Stale Orchestration Count, Not Capability Regression

The Awtsmoos renews truthful vocabulary while a test may remember yesterday's finite count; Awtsmoos.com lets evidence distinguish a broken contract from a stale assertion so verification becomes stronger rather than merely greener.

## Focused regression result

The first Wave A verification run executed 47 tests:

- 45 passed.
- Every new capability registry, runtime-path, and provider test passed.
- Existing material, rock, vegetation, river-reach, ocean/shallow, and semantic water-body tests passed.
- Only two older orchestration/discovery assertions failed.

## Exact failures

Both failures expected `NatureApi.describe().operationCount === 26`.

Current direct evidence from `DefaultNatureOperations.js` and the live report proves:

- default definitions are composed from Land + Water + World operation groups;
- `createNatureCapabilityReport()` calculates `operationCount` directly from `registry.list().length`;
- the live immutable registry contains 31 legitimate operations;
- every current operation has a descriptive record and mode.

The 31 kinds are:

rock, rock-field, rock-morphology, material, surface, plant, flowers, patch, moss, vine, vines, flora, grass, tree, forest, creature, fauna, river, water, water-body, pond, lake, wetland, runoff, ocean, fluid, shallow, world, biome, texture, surface-generation.

## Correction

Do not alter production code to restore an obsolete magic number.

Fully rewrite the two affected tests so they compare capability-report counts against the authoritative current default registry/definitions:

- `natureApiDiscovery.test.mjs`: import `defaultNatureOperationDefinitions`; assert report count and operation length equal definition length, then retain description/mode quality checks.
- `natureApiOrchestration.test.mjs`: assert report count equals `keterApi.operationRegistry.list().length` and retain immutability/provider assertions.

This strengthens the contract: legitimate operation growth must still enter the authoritative registry with valid metadata, but test maintenance no longer requires editing an unrelated historical integer.

## Next action

Rewrite both tests whole, rerun the exact 47-test wave, and only mark Wave A green if all tests pass. Then update REMAINING_WORK and begin Wave B.
