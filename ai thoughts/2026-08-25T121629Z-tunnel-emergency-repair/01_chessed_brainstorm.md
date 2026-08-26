# B"H
## Boruch Hashem — Blessed is He

# Phase One: Chesed Brainstorm — Emergency Continuity Without a Single Point of Failure

The Awtsmoos renews each instant; this design asks the tunnel to renew its repair path too.
Awtsmoos.com should keep one living rescue flame even when the normal guardian loses its view.

## Observed failure graph
- A healthy 1.0.558 runtime existed and was intentionally retired for explicit refresh.
- The replacement never produced agent PID / registration / project-root readiness evidence before cleanup.
- Cleanup then marked the supervisor stop exactly as a delayed launchd start arrived.
- Published release metadata was unavailable, so repeated retries eventually selected an older sealed 1.0.522 runtime.
- The installer returned fatal failure with no automatic sealed-emergency continuity handoff.
- The local `awt` wrapper was absent, making the existing deep recovery path difficult to discover.
- The sealed emergency runtime itself worked immediately when directly launched.

## Broad solution universe
- Preserve the incumbent until a replacement proves outer-service birth when atomic handoff is possible.
- Separate outer-service-start readiness from agent-registration readiness.
- Add a bounded grace phase when launchd is loaded but the supervisor PID has not appeared yet.
- Never let failure cleanup kill a supervisor that arrived inside a bounded late-start grace window.
- Automatically launch the sealed Tier-0 emergency runtime after replacement failure.
- Verify emergency registration before declaring continuity restored.
- Keep emergency recovery outside the replaceable live runtime tree.
- Add a portable detached fallback when launchd itself is broken.
- Add a known-good sealed-generation fallback after Tier-0 continuity is established.
- Add a standalone remote emergency bootstrap whose dependencies are much smaller than the full installer.
- Expose a stable emergency endpoint that can install/launch only the rescue runtime.
- Make remote recovery independent of published release metadata when a valid local sealed slot exists.
- Add an online remote slot-refresh path for when the local emergency slot is corrupt or absent.
- Give every repair layer structured receipts and exact failure reasons.
- Put AI-first emergency commands at the top of tunnel docs, not buried in implementation notes.
- Add tests for delayed launchd start, missing PID, missing project receipt, stale stop marker, metadata outage, and sealed fallback.
- Preserve unrelated repository changes and never reset the dirty worktree.

## Five candidate architectures
1. Timeout-only patch: simplest, rejected as insufficient because it leaves dead-end recovery.
2. Installer fallback only: better continuity, but does not fix supervisor/readiness race.
3. Supervisor-only self-heal: useful after installation, but does not protect failed reinstall custody.
4. Layered continuity controller: staged readiness + automatic sealed fallback + remote rescue endpoint.
5. Dual-generation blue/green activation: strongest long-term model, but larger change than needed for this incident.

Preferred direction: Architecture 4 now, with seams that permit Architecture 5 later.
