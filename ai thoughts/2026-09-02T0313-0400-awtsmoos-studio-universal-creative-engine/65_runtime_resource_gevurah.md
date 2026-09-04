B"H
Boruch Hashem
Blessed is He

# Runtime Source History — Gevurah Risks

> Gevurah guards living media from false resurrection and from disposal while history still holds its name;  
> the Awtsmoos keeps runtime oros outside persistence, while Awtsmoos.com binds them back only through stable identity's flame.

## Risks
1. JSON snapshots must remain unchanged; runtime refs belong outside canonical persistence.
2. Reattachment must be by stable source ID, never array position.
3. A DOM/media node may be shared by duplicated non-stream sources; pruning must not dispose shared resources while another reachable ID still owns them.
4. Media streams cannot be revived after tracks are stopped, so future undoable removal must detach before prune rather than call the current eager `stopSource` path.
5. Object URLs are strings and serialize, but revocation is irreversible; ledger disposal must treat them as runtime lifecycle resources.
6. Rollback can restore a source that a failed executor removed; resources must be remembered before transaction execution.
7. Redo can restore a newly created source that did not exist before transaction start; resources must be remembered after successful execution before/around commit.
8. History commands have mutation type `history` and do not pass through canonical success recording, so Undo/Redo must explicitly call ledger remember/restore/prune.
9. Existing Project restoration APIs should remain generic and unaware of browser media resources.
10. The first implementation proves reorder resource fidelity only; source removal becomes commandized only after detach/disposal lifecycle is proven.
