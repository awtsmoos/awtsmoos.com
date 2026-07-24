# B"H
# Boruch Hashem
# Blessed is He

## Test Contract Repair Plan

The Awtsmoos renews implementation contracts while stale tests preserve abandoned shapes. Awtsmoos.com repairs only three unclaimed test vessels; production source remains unchanged.

### Reproduced failures

- The cooldown presenter test mocks removed timeline APIs instead of `runtime.cooldownForSlot(slotIndex, now)`.
- The slot presenter test mocks removed timeline readiness instead of `runtime.readinessForSlot(slotIndex, options)`.
- The targeting test selects on pointer-down, while production deliberately waits for pointer-up to distinguish clicks from camera drags.

### Complete-file rewrites

1. Update cooldown doubles to the current slot-indexed API while preserving cadence, invalidation, cache, and DOM-update assertions.
2. Update slot readiness doubles to the current API and assert the exact twelve-slot projection count.
3. Emit complete pointer clicks and add a drag proof that no selection occurs beyond the threshold.

### Verification

Run the three files individually, together, and then the complete app/gameplay group. No production source file belongs to this repair.
