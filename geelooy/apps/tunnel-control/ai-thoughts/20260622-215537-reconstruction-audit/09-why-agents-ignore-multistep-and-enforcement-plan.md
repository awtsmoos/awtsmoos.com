# B"H — Why agents ignore the multi-step process

## Observed truth
Multiple agents are not reliably following the multi-step/multiple-choice mission protocol. This is not because the guidance is absent. It appears in every response. The issue is that it is mostly advisory text, repeated too broadly, and not tied to action-level hard gates.

## Likely causes
1. Guidance overload: every response contains too much repeated protocol text, so agents skim past it.
2. Non-blocking protocol: `mustContinue`, `mustCallNext`, and multiple-choice are returned, but ordinary tool calls still succeed even if the agent ignored the prior required step.
3. No mission room binding: agents can run write/command actions without first joining a mission room.
4. No claim gate before writes: claim guidance exists, but actions are not universally blocked when no claim exists.
5. Cross-response confusion: stale/unrelated responses train agents to distrust or ignore fields.
6. Tool wrappers hide fields: some agent UIs only surface `ok`, `content`, or `stdout`, burying `mustCallNext`.
7. Human language collision: “multi coffee / multi choice” sounds like a suggestion, not a runtime contract.
8. Missing monotonic protocol state: server does not remember that agent X owes step Y before action Z.
9. Aliases and legacy actions: unsupported `commandBatch` made agents abandon the ritual path.
10. Response finality bug: responses sometimes set `finalAnswerAllowed=true` for narrow action completion, even when global mission work remains.

## Stronger enforcement design
- Add missionProtocolState per logicalAgentId/session.
- Every response issues a `protocolToken` and `requiredNextAction`.
- Next action must echo `protocolToken` or server returns `protocol_required_step_missing`.
- Write-like actions require active room membership and claim unless explicitly bypassed with admin/debug flag.
- If no mission room selected, block file writes/commands with one action: `missionProjectDiscover` then `missionProjectJoin`.
- If multiple-choice is required, next non-protocol action must include `multipleChoiceAnswer=B|C|D|A` plus proof.
- Collapse guidance to one visible instruction; make the rest machine-readable.
- Mission Control UI should show an “Obedience Monitor” grid of agents: missing room, missing claim, ignored next action, stale heartbeat.

## Immediate minimal implementation
1. Add `missionProtocolGuard.js` in tunnel-control API wrapper or server core.
2. Mark write/command actions as dangerous unless room+claim present.
3. Return concise block response when protocol ignored.
4. Add tests proving write without room is blocked or strongly redirected.

## Caveat
Blocking every command immediately could break existing workflows. Safer rollout: warn-only for read/list/status; block write/bulkWrite/delete/move/applyPatch/command with allowCommands unless mission bypass flag present.
