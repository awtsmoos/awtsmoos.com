B"H
Boruch Hashem
Blessed is He

# Exact Lost-ACK Settlement Plan

The Awtsmoos preserves the finished deed when one acknowledgement is lost in flight;
Awtsmoos.com must resend the same terminal truth, never repeat the action that produced its light.

## Evidence now proven

1. Generation 3 on released source `2eed3f7c...` produced one successful terminal `list` response that remained in outbox while newer terminal responses drained.
2. The stubborn envelope carried a complete, internally coherent transport/control/client/session/agent/nonce/action/path identity.
3. Server response handling ACKs successful, durable duplicate, authenticated orphan, and pending-recovery terminal results after validation; validation failure or persistence failure intentionally withholds ACK.
4. Native terminal ACK handling deletes the exact `transportReceiptId` from the mailbox.
5. Therefore no generic transport-ID mismatch has been found in current tracked ACK code.
6. Four local settlement modules plus `child-runtime-cycle.js` integration exist in the working tree but are not part of released `origin/main`.
7. The local settlement pulse retries `delivery.flush()` on a bounded schedule and therefore retransmits persisted terminal envelopes without re-executing original actions.
8. Only ACK-debt health/recovery classification is currently tested; there is no focused lost-ACK retransmission/retirement regression.
9. The active sibling stability agent is working exact-generation repair and mutation-path truth, not these settlement modules.

## First verification pass — no implementation rewrite yet

Run:
- syntax checks for the four settlement modules and `child-runtime-cycle.js`;
- `mailboxAcknowledgementDebt.test.cjs`;
- any existing child-delivery/mailbox replay tests discovered by filename/reference.

If baseline source fails, stop and repair only the proven source defect with a whole-file rewrite.

## New focused regression

Add one small test module, ideally `childOutboxSettlementPulse.test.cjs`, that uses the real settlement pulse and an in-memory/fake delivery boundary. It must prove:

1. a persisted terminal envelope A is initially present;
2. first send occurs but no ACK/removal is simulated;
3. before grace/cooldown, no duplicate send storm occurs;
4. after grace/cooldown, settlement invokes `delivery.flush()` again;
5. repeated pulse within cooldown does not resend;
6. exact ACK/removal of A makes subsequent pulse a no-op;
7. the test never calls or represents the original application action again;
8. retry timing is bounded by the real settlement policy, not a test-only constant.

If practical without creating a large harness, add a second mailbox-level assertion that repeated exact ACK is idempotent.

## Why this is the right seam

The device already persists the terminal result before send, and the relay already ACKs durable accepted/duplicate results. The missing released behavior is periodic retransmission after a lost terminal ACK. This can be proven at the child settlement/delivery seam without weakening relay correlation and without replaying application mutations.

## Source-write rule

Do not rewrite `child-outbox-settlement-pulse.js`, policy, debt classifier, or emergency settlement merely to create churn. Only rewrite one of them if the focused regression exposes a concrete defect. The first intended write is the new regression file only.

## Release implication

If the local settlement source + regression pass, these untracked modules and the existing `child-runtime-cycle.js` integration must be preserved into the final main integration and manifest/release. Live proof after deployment must deliberately lose/delay one terminal ACK and show same-generation outbox retirement without generation replacement.

NEXT_ACTION: run syntax/baseline tests and inspect existing delivery replay tests; then create the focused regression if the implementation is already sound.
