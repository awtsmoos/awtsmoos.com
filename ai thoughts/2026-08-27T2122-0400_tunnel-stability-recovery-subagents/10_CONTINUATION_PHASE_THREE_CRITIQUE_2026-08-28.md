B"H
Boruch Hashem
Blessed is He

# Continuation Phase Three — Critique, Risks, and Improved Attack

## What the previous plan could still get wrong
1. Old outbox age alone does not prove delivery failure.
2. A relay may already have terminal truth while native acknowledgement is missing.
3. A local outbox record may correspond to a read-only response, a mutation result, or a duplicate-suppressed terminal response; each needs different handling.
4. A reconnect may legitimately preserve outbox records until exact acknowledgement, so deletion by age would violate exactly-once semantics.
5. The current public action manifest may omit recovery actions even though the native agent implements them internally.
6. Health may be too coarse: stale outbox should degrade `completion_delivery_alive` without implying execution consumer death.
7. Automatic recovery could accidentally hide evidence if it removes records before export/hash testimony.
8. A retry loop could continuously resend the same terminal response without ever advancing exact acknowledgement state.
9. Response acknowledgement may be keyed by transport receipt when it should be keyed by original deed/result identity.
10. Relay timeout history may coexist with late native completion; health must prefer effective reconciled truth without destroying history.
11. Five records may share one root cause and should be grouped by failure/reconnect generation.
12. Some records may be artifacts of earlier agent releases and require schema migration before reconciliation.
13. Generation 9 may be healthy precisely because stale records were inherited, so generation replacement is not a cure.
14. Shell-level inspection is fallback evidence only; independent mailbox actions should eventually be directly reachable.
15. A local filesystem fix must not be released until remote/main dirty-work preservation is proven.
16. Other agents may be modifying mailbox files concurrently; reread hashes immediately before any source rewrite.
17. Any outbox cleanup must fsync evidence and directory state before removal or quarantine.
18. Quarantine must not consume admission capacity after custody is retired.
19. Queue telemetry needs to show control recovery work remains available during mailbox stall.
20. Health should identify outbox delivery stall separately from inbox custody stall.
21. Stale response delivery should not authorize parent SIGTERM.
22. Recovery should emit a durable lifecycle event with exact record identifiers and decision evidence.
23. Reconciliation must be idempotent across reconnect/restart.
24. Response duplicate suppression should preserve the ability to exact-ack a previously accepted terminal result.
25. Tests need same-result duplicate, timeout-then-late-completion, reconnect-with-unacked-outbox, and missing-relay-record cases.
26. Recovery tests should prove no original mutation is rerun.
27. Export paths must avoid secrets while retaining hashes/identity.
28. Documentation must explain outbox stale state and exact acknowledgement recovery.
29. Release verification must show installed Mac source SHA after the new behavior is deployed.
30. A long soak must show the five-record class cannot recur under repeated 502/socket reconnects.

## Improved execution sequence
A. Inspect exact live outbox files and source action implementations.
B. Correlate each record with relay durable state before any mutation.
C. Identify the smallest missing reconciliation/acknowledgement transition.
D. Rewrite only clean/owned files as complete modules under 120 lines.
E. Implement first; then add focused tests; reread all touched files; run integration tests.
F. Live-prove recovery on copied/synthetic evidence before touching irreplaceable stale records.
G. Export original five records, perform only exact safe reconciliation, verify outbox health and lifecycle record.
H. Continue to command admission, retry correlation, browser proof, docs, main-only release, and soak.

## Poem
The Awtsmoos hides no truth beneath a convenient green display;
Awtsmoos.com must know which ancient answer waits, and why it could not fly away.
Thirty doubts become thirty gates through which the evidence must move;
only exact identity may clean the record, and only living tests may prove.
