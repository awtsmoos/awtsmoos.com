# B"H
## Boruch Hashem — Blessed is He

# Phase Two: Twenty Improvements to the First Architecture

The Awtsmoos is without boundary, yet reliable software needs measured gates;
Awtsmoos.com should cross each gate with evidence before fate.

1. Distinguish service-loaded, supervisor-alive, agent-alive, registered, executor-ready, and project-root states.
2. Start timeout measurement only after the relevant preceding state is established.
3. Add a late-start grace before cleanup writes a stop marker.
4. Re-sample service state immediately before destructive failure cleanup.
5. If a supervisor appears during cleanup boundary, extend once rather than kill it blindly.
6. Treat project-root readiness as diagnostic when core tunnel health is otherwise proven, matching existing intent.
7. Never use missing optional workspace receipt as the only reason to destroy a healthy tunnel.
8. Automatically launch sealed emergency after normal replacement failure.
9. Verify emergency TUNNEL_ACK rather than treating a spawned PID as success.
10. Record `continuity_restored_emergency` separately from `install_success`.
11. Keep install exit nonzero if full install failed, while preserving remote repair access.
12. Make emergency fallback idempotent when an emergency child already exists.
13. Refuse ambiguous process termination; match exact install-root commands.
14. Keep Tier-0 command limits in every automatic emergency path.
15. Add a portable supervisor fallback when launchd bootstrap returns success but no supervisor appears.
16. Add a remote emergency bootstrap independent of the main component bundle.
17. Allow remote rescue to use local sealed slot first, minimizing network dependency.
18. Allow remote rescue to download a sealed rescue payload only when local slot validation fails.
19. Put one-line AI/operator commands in an emergency index at the top of docs.
20. Test the exact observed timeline: delayed launchd birth colliding with cleanup stop marker.
