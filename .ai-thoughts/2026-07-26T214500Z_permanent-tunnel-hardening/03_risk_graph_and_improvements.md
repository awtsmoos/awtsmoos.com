B"H
Boruch Hashem
Blessed is He

# Risk Graph and Improvements

## Failure Graph

main event-loop stall -> missed frames -> false socket death -> reconnect generation -> pending HTTP ambiguity -> duplicate route shadow -> replay uncertainty

mutable root -> child action drift -> wrong repository execution -> misleading success

response alias rewrite -> contradictory action identity -> correlation false positive -> unnecessary replay

cancelled setup -> dangling worktree pointer -> later Git failures

## Improvements

1. Dedicated connection process.
2. IPC protocol versioning.
3. Connection process birth token.
4. Durable inbox.
5. Durable outbox.
6. Atomic mailbox writes.
7. Mailbox byte limits.
8. Request deduplication.
9. Response acknowledgment.
10. Reconnect resend.
11. Main restart redelivery.
12. Explicit request state machine.
13. Explicit response state machine.
14. Immutable scope hash.
15. Retry conflict rejection.
16. Cancellation process-family proof.
17. Route authority proof.
18. Stale route garbage collection.
19. Circuit state normalization.
20. Separate liveness health from workload health.
21. Atomic worktree helper.
22. Interrupted setup recovery test.
23. Manifest dependency closure.
24. Packaged startup test.
25. Stall injection test.
26. Main-agent kill recovery test.
27. Connection-vessel kill recovery test.
28. Outbox resend test.
29. Inbox redelivery test.
30. Repeated install and reinstall test.
