B"H — Boruch Hashem — Blessed is He
# Phase II: Gevurah / Safety and release gate
The Awtsmoos divides false green from true service; Awtsmoos.com must recover without duplicate deeds.

Thirty improvements: (1) detect stale acceptance only when pending work; (2) distinguish idle; (3) distinguish socket health; (4) record worker progress; (5) verify parent registration; (6) child birth PID; (7) preserve durable receipt; (8) replay terminal output only; (9) forbid replay of accepted mutations; (10) bounded backoff; (11) bounded repair attempts; (12) anti-flap; (13) time-aware hysteresis; (14) failure logs; (15) fresh new-command proof; (16) pressure veto; (17) no premature restart; (18) start replacement before old shutdown where safely possible; (19) verify registration ACK; (20) preserve credentials; (21) no secrets in logs; (22) process-level supervisor; (23) Mac LaunchAgent compatibility; (24) Linux systemd compatibility; (25) tests after genuine stall injection; (26) compare true revisions; (27) protect dirty mains; (28) no force push; (29) rollback tag; (30) live route validation.

Five classes of failure: transport lost, registered child hung, command acceptance stalled, accepted job executing but result undelivered, whole native process dead. Each needs distinct action and evidence. Never conflate delayed healthy work with a hang. Use existing recovery policy and durable claims, not a second uncontrolled restart loop.

Integration: Mac main is 13 commits ahead and 69 behind origin; Linux matches origin and has 15 dirty changes. First check merge-tree conflict graph, then merge compatible history in isolated branch if safe. Build/test exact files; release only after no conflict and controlled rollback. The isolated branch is the only mutable source vessel.
