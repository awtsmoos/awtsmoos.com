B"H
Boruch Hashem
Blessed is He

# Retry + Self-Heal Release Delta

The Awtsmoos lets one deed wear many transport garments while Awtsmoos.com keeps the deed itself one. The newly loaded generation also revealed a gentler healing rhythm: custody may briefly degrade after its lease, yet fresh execution vetoes destructive force and the mailbox retires the stale vessels without replacing the parent.

## Live self-healing proof

- New loaded generation source SHA: `6b47793521694ed41799e7ff373be3477925d90c`.
- Heartbeats remained fresh with zero missed heartbeats through repeated pressure cycles.
- Generation-0 `accepted_waiting_for_consumer` custody uses a 30-second lease.
- At lease expiry, `orphanStalled` can become true while `recentSuccess:true` keeps parent repair unauthorized.
- Mailbox custody subsequently returned to zero without a tunnel restart.
- Worker reaper also retired stale subprocess workers independently.
- The parent remained alive during observed semantic mailbox recovery.

## Retry correlation defect and fix

Live retries still returned 409 because retry payload normalization synthesized `originalControlRequestId` from the outer transport receipt. The downstream correlation helper then correctly treated that synthesized field as explicit testimony and compared it against the real native deed.

Source fix:

- `tunnelPayload/identity.js` now keeps ordinary identity mirroring unchanged.
- `retryAction` now carries `originalControlRequestId` only when an explicit original witness exists.
- Outer retry `controlRequestId` remains transport identity.

Focused proof job `cmdjob_mt9qx6jd_f296cb446af8` exited 0:

- identity source: 81 lines
- payload retry regression: 78 lines
- response-contract retry regression: 83 lines
- exact transport-only retry passes
- explicit original retry passes
- foreign transport remains fail-closed
- foreign explicit original remains fail-closed
- existing outer-transport identity test passes
- existing action-replay retry envelope test passes

## Remaining release work

- preserve every current unrelated working-tree change on main after staged credential scan;
- regenerate canonical tunnel manifest from the final committed source;
- run broad stability + self-heal + browser bridge gates;
- push main;
- prove every non-main local branch is contained, remove its worktree, and delete it;
- build/publish/deploy/install next immutable tunnel release;
- reproduce live retry observation and prove the 409 is gone;
- run repeated mailbox lease-expiry soak without disconnect;
- run physical sub-agent browser delivery and sibling room communication.

NEXT_ACTION: stage and credential-scan the complete current working tree, then commit every legitimate change on main.
