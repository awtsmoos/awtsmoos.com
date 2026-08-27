B"H
Boruch Hashem
Blessed is He

# Outbox Redelivery — Final Plan

The Awtsmoos lets one completed deed speak until truth is heard; Awtsmoos.com will add an acknowledgement-seeking pulse without giving execution a second birth.

## Files to write

1. `geelooy/apps/tunnel/agent/lib/connection-vessel/child-outbox-settlement-pulse.js`
	- Own retry cadence only.
	- Inspect registration and outbox count.
	- First retry after a short grace period.
	- Exponential backoff capped at 30 seconds.
	- Call only `delivery.flush()`.
	- Reset when outbox drains or registration is absent.
	- Expose a small immutable status witness.
2. `geelooy/apps/tunnel/agent/lib/connection-vessel/child-runtime-cycle.js`
	- Compose the pulse beside existing mailbox reconciliation.
	- Tick the pulse before publishing health.
	- Include pulse testimony in child state.
	- Preserve registration-transition flush and all existing recovery behavior.
3. After code-first implementation, add `childOutboxSettlementPulse.test.cjs`.
	- No retry while unregistered.
	- Grace period before first retry.
	- Exponential cooldown and cap.
	- Empty outbox resets state.
	- Only terminal `delivery.flush()` is called; no request execution primitive exists in the module.
4. Re-run `responseAckRecovery.test.cjs`, mailbox durability, child runtime/watchdog tests, and the new pulse regression.

## Live proof after deployment

- Recreate a server-observation response whose ACK is temporarily missed or withheld.
- Keep the same socket generation alive.
- Observe pulse retransmission of the same outbox receipt.
- Server duplicate reconciliation ACKs it.
- Native outbox reaches zero without parent restart.
- Mailbox health returns healthy while `lastRegisteredAt` remains unchanged.

NEXT_ACTION: verify the two source targets are not concurrently dirty, then write pulse + cycle as complete files before tests.
