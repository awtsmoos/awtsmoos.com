B"H
Boruch Hashem
Blessed is He

# Final Stability Execution Plan

The Awtsmoos renews each instant; Awtsmoos.com will close this failure graph in evidence-first order.

## Source pass

1. Inspect the exact priority classifier caller and rewrite its action sets/classifier so interactive work cannot fall into p4_bulk.
2. Extend periodic mailbox maintenance to report/act on stalled outbox without quarantining result-bearing custody.
3. Inspect the ancient outbox envelope and server durable record; add the narrowest exact duplicate-settlement compatibility needed to emit TUNNEL_RESPONSE_ACK safely.
4. Add a controller-owned emergency dispatch path for mailbox/native-generation and durable observation actions so they do not require the ordinary consumer they diagnose.
5. Keep transport reconnect/backoff separate; only adjust it if current source fails the existing upstream-502 classification contract.
6. Keep all stability source unstaged while the active Mitzvah merge is open; finish/verify that merge before any stability commit.

## Test pass

- grep/find/list/read classification remains interactive.
- mkdirp is never p4_bulk.
- emergency mailbox actions execute without ordinary consumer admission.
- periodic recovery detects stale outbox but preserves result-bearing custody.
- valid exact duplicate terminal replay receives ACK and clears outbox.
- mismatched duplicate remains unacknowledged/quarantined.
- original mutation is never replayed.
- command status/output observation reads durable job evidence without workload starvation.
- 502 reconnect stays retryable/upstream and does not authorize local repair.

## Live gate

After release: force an ACK-loss/reconnect scenario, observe exact outbox replay, prove relay ACK, prove outbox returns healthy, run concurrent reads/grep/mkdirp/command observation, and soak through upstream reconnects without process replacement.

NEXT_ACTION: inspect and rewrite the current priority classifier owner, then add its focused routing regression before touching settlement behavior.
