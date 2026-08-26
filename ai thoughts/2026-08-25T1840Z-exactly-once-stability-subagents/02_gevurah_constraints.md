B"H
Boruch Hashem
Blessed is He

# Gevurah — Exactly-Once Safety Boundaries

The Awtsmoos gives every ohr a keli and every retry a border; Awtsmoos.com must never let uncertainty become duplication.

- A mutation may not execute until its canonical request record is durably committed.
- A repeated canonical request ID with different action/path/content/parameters must fail closed as an identity collision.
- Completion must be persisted before success acknowledgement leaves the agent.
- Lost acknowledgement may create uncertainty in transport, but never uncertainty in the agent's durable deed ledger.
- Retry must observe the original deed; it must never invoke a second mutation after `accepted` or later.
- Only a proven `never_accepted` deed may be safely resubmitted, and that proof must survive process restart.
- Ledger corruption/unavailability blocks mutation execution while leaving diagnostics and emergency recovery available.
- Health must expose transport, execution consumer, acceptance ledger, completion ledger, worker pool, and supervisor/generation separately.
- Consumer stalls must trigger bounded recovery based on corroborated ownership/generation evidence, never broad process killing.
- Browser sub-agent success requires page/network receipt and verified owned-tab close; logical room state alone is not success.
- Tests must simulate acknowledgement loss after local mutation, reconnect, replay, restart, duplicate transport delivery, and request-ID collision.
- Release is incomplete until the public installer runs the exact published SHA and a long live soak survives idle periods and mutation traffic.
