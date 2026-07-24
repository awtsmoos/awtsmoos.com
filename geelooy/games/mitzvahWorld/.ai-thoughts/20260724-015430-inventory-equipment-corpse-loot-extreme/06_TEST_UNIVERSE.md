B"H

Boruch Hashem

Blessed is He

# Test Universe

The Awtsmoos recreates each assertion and each observed result. Tests are not proof of all reality, but they are measured keilim that prevent confidence from impersonating evidence. Awtsmoos.com is named while this suite defines what must be seen.

## Inventory Transactions

### Accepted paths

- Add one stack to an absent item.
- Add quantity to an existing stack.
- Add multiple distinct entries in one transaction.
- Aggregate duplicate entries in one transaction.
- Remove a partial quantity.
- Remove the final quantity and clear equipment.
- Buy an item with exact available currency.
- Restore valid inventory and equipment.

### Rejected paths

- Zero quantity.
- Negative quantity.
- Fractional quantity.
- `NaN` quantity.
- Infinite quantity.
- Unsafe integer quantity.
- Unknown item.
- Stack capacity overflow.
- Insufficient removal quantity.
- Insufficient currency.
- Unsafe purchase total.
- Non-sale item.

### Atomicity evidence

- Original item arrays remain unchanged when a transaction fails.
- Store state remains deep-equal after failure.
- Listener count remains zero after failure.
- Listener count is exactly one after accepted addMany, remove, buy, equip, unequip, and restore.
- Purchase never exposes an intermediate charged-but-not-added snapshot.

### Persistence evidence

- Duplicate stacks aggregate.
- Corrupted excess clamps to stack limit.
- Unknown items disappear.
- Invalid quantities disappear.
- Equipment without ownership disappears.
- Equipment in the wrong slot disappears.
- Learned and pinned Torah state retains current validation behavior.

## Corpse Loot

- Living enemy rejects with `ENEMY_STILL_ALIVE`.
- Previously looted enemy rejects with `CORPSE_ALREADY_LOOTED`.
- Actively claimed enemy rejects with `CORPSE_LOOT_IN_PROGRESS`.
- Successful loot calls `addMany` once.
- Successful loot marks `looted`, clears selection, and records collected state.
- Successful loot emits `enemy:looted` and `npc:clear` once.
- Re-entrant loot from an event listener rejects.
- Inventory transaction failure releases the claim.
- Inventory transaction failure leaves selection intact.
- Empty loot still consumes the corpse without publishing inventory.
- Receipt items are cloned.
- Notification failure does not reopen consumed loot.

## Equipment Runtime

- Exact canonical right hand wins.
- Exact canonical spine wins.
- Fallback `right-hand` resolves by alias.
- Fallback `left-hand` resolves by alias.
- Normalized `mixamorigRightHand` resolves.
- Missing preferred hand falls back deterministically.
- Missing spine uses model root visibly.
- Draw and sheath reuse the same weapon object.
- Draw and sheath update actual parent.
- Right and left side transforms remain finite.
- Weapon replacement occurs only when item ID changes.
- Weapon unequip detaches and hides.
- Model rebinding removes weapon from old model.
- Model rebinding attaches weapon to new model.
- Coat unequip hides the jacket.
- Coat equip restores the jacket.
- Kippah equip toggles kippah/top-hat visibility.
- Runtime diagnostics preserve canonical launcher fields.
- Destroy removes listeners and detaches weapon.

## Static Architecture

- Every touched `.js` passes `node --check`.
- Every touched `.mjs` parses through `node --test`.
- Every owned relative import resolves.
- No owned connected import contains a query string.
- No touched source line begins with indentation spaces.
- No touched source is minified or contains compressed one-line blocks.
- No generated screenshots, logs, traces, HAR files, or temporary assets enter Git.
- Git diff contains only owned source, focused tests, and worker planning/handoff files.

## Integration Evidence Within Worker Boundary

- Existing inventory/Torah tests pass.
- Existing canonical equipment receipt expectations remain satisfiable without rewriting the receipt.
- New modules load under the same ESM runtime as existing tests.
- One complete focused suite runs after the first pass and again after refinement.
