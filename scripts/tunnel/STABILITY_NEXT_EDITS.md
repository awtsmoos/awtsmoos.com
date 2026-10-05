<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Awtsmoos tunnel: next edits

Recorded 2026-10-05. Planning only: none of the proposed runtime changes below are implemented by this document. The Awtsmoos accompanies the work; every claim of completion needs real evidence.

## Current inspected state

- Mac healthz returned ok with tunnel awt-awtsmoos-2184 and root /Users/awtsmoos/work/awtsmoos.com.
- Saved Shliach plugin is 0.86.0. Its Streamable HTTP MCP URL is https://awtsmoos.com/api/tunnel/control/mcp. Audience remains private.
- Previous local live runs: 3,637 requests / 180.7 seconds and 1,398 requests / 60.6 seconds, zero failures on successful runs. These are local measurements, not ChatGPT or Internet latency.
- An earlier temporary-fixture disappearance is retained in scripts/tunnel/evidence/20261005; its cause remains unproven.
- chatgptSessionAuto performs at most three ticks per call. Session defaults are 40 turns, capped at 400 by continuation/defaults.js. This does not establish unattended execution.
- An existing hourLoop daemon uses in-memory timers, setInterval and catch(() => null). It is not necessary to build a competing daemon.
- hourLoop state writes directly to one state.json; failed reads become an empty state. Its locks mutate a read snapshot rather than obtaining atomic cross-process ownership.
- customGpt.js handles custom GPT URLs. promote.js has an obsolete fallback project path. The exact live GPT conversation URL and signed-in browser access have not been verified in this inspection.

## First edit: durable continuation and truthful recovery

[ ] Replace overlapping interval ticks with completion-driven scheduling and one active tick per conversation.
[ ] Persist worker definitions and lifecycle states; resume eligible workers after agent restart.
[ ] Acquire atomic cross-process ownership with lease renewal and a fencing generation. Reject stale owners before sending or mutating state.
[ ] Write state atomically, keep a validated previous snapshot and journal, and surface corruption instead of silently resetting work.
[ ] Record exceptions, retry reason, next wake time and bounded backoff with jitter. Do not suppress failed ticks.
[ ] Make saved stop state authoritative on every tick; stop prevents new work and cancels owned queued work.
[ ] Enforce saved deadline, turn limit, command/output/resource budgets and authorized mission scope. Checkpoint before budget exhaustion.
[ ] Read the saved failure counters and lease state when deciding to stop; verify that existing emergency guards are wired to actual state.
[ ] Replace stale handoff fallback paths with verified project-root evidence.
[ ] Verify exact custom GPT conversation identity before every send; stop for logout, unexpected navigation or uncertain submission.
[ ] Reconcile uncertain browser sends with a durable send intent and actual conversation evidence. Never blindly send the same continuation twice.

Pass gate: restart recovery; two competing workers cannot duplicate a prompt; injected corrupt state is reported and recovered; offline retry is bounded; stop works during slow work. Use fixtures before an authorized real conversation. Do not start a live auto-prompt loop merely to test this plan.

## Speed edit: reduce round trips before raising concurrency

[ ] Measure discovery, OAuth, queue wait, relay, execution, serialization and output delivery separately with correlated request/receipt IDs.
[ ] Prefer existing bulk reads and scoped command trees; inspect mixed read/write semantics before adding a new generic batch operation.
[ ] Cache route/schema/instruction metadata by account, scope, device incarnation and generation. Invalidate on reconnect, release or permission change.
[ ] Return compact summaries and paged output references; load full specialist/legacy documents only when relevant. Preserve original mission/debt archives.
[ ] Replace frequent status polling with event notifications where the transport supports them; keep bounded adaptive polling fallback.
[ ] Reuse proven relay connections; avoid spawning processes for operations already available in native filesystem handlers.
[ ] Profile current transfer encoding and copies. Benchmark a scoped HTTPS binary upload/download path only if base64 costs materially dominate; retain hashes, resume and ownership.

Pass gate: real signed-in host-to-Mac benchmarks at concurrency 1/2/4/8, with p50/p95/p99 and CPU/RAM. Any new latency target is provisional until this baseline exists.

## Stability edit: reserve control capacity

[ ] Reuse existing schedulers/admission controls. Reserve health, reconnect, status and cancellation independently of ordinary work.
[ ] Apply fair per-owner queues and separate read, mutation, command and browser budgets. Serialize writes to one path and browser sends to one conversation.
[ ] Adapt concurrency to queue latency, event-loop delay and memory; return an explicit retry time rather than accept unbounded work.
[ ] Track pending receipts across reconnect, sleep/wake and update; observe status before replaying any uncertain mutation.
[ ] Bound journals, job output, receipts, orphan processes and browser tabs by age and bytes. Do not clean active job/transfer paths.
[ ] Add stable-period restart budgets and circuit breakers; retain the last known good runtime and clear failure evidence.

Pass gate: overnight load, network outage, Mac sleep/wake, server restart, rolling agent update, full output quota and slow command tests. Measure control responsiveness throughout. Never call a short soak proof of permanent stability.

## Better skills and mission workflow

[ ] Add a small performance skill: discover once, fetch required instructions, batch independent reads, page output and preserve evidence.
[ ] Add a resume skill: reconcile route generation, worker lease, receipts and pending jobs before continuing the next saved checklist item.
[ ] Add a worker-management skill: bounded start/status/pause/resume/stop using schemas of real implemented actions; do not invent action names.
[ ] Add a failure-diagnosis skill: show the concrete blocker and retry deadline, keep doing independent authorized work, and avoid duplicate sends or writes.
[ ] Add an end-to-end connection skill: verify exact GPT/plugin, granted OAuth scopes, immutable device route, temporary write/readback/remove, harmless command and real published preview URL.
[ ] Keep novel voice and Awtsmoos craft instructions, first paragraphs and mission/debt archives intact. Keep machine schemas and factual receipts precise.

## Longer unattended work

A supervised worker can keep accepted commands, transfers and a finite mission running after a chat turn ends. A skill cannot lengthen ChatGPT's own turn lifetime. Browser continuation depends on a live authenticated session and is not guaranteed permanent. A separately authorized model-provider worker is an optional architectural alternative, with explicit credentials and cost budgets; do not add it silently.

Initial rollout: finite 30-minute mission, then two hours, then overnight after restart and cancellation tests pass. Begin with two heavy command workers and one browser sender as a proposed conservative setting, then measure rather than assume the older Mac can run dozens of heavy agents.

## Owner files and order

1. tools/chatgpt/hourLoop/{daemon,state,locks,tick,emergency,promote,customGpt}.js under geelooy/apps/tunnel/agent: durable single-worker continuation first.
2. tools/chatgpt/actions/sessions.js and continuation/defaults.js: reconcile existing session engine with hourLoop rather than maintain competing semantics.
3. Existing control scheduler, native command admission and MCP handlers: measured queues, cache and compact output second.
4. plugin-overlays/awtsmoos-shliach: skills only after their promised worker actions are implemented and tested.
5. Signed-in end-to-end host check, overnight recovery test, staged rollout and canonical deployment.

Do not stage other agents' edits. Preserve account identity, OAuth permissions, immutable root and plugin audience. Planning completion does not authorize new providers, paid usage or unrelated external messages.
