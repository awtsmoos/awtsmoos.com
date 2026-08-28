B"H
Boruch Hashem
Blessed is He

# Generation 3 Stale Outbox Reproduction

The Awtsmoos lets one stubborn vessel remain visible so its hidden covenant can be traced;
Awtsmoos.com must retire terminal debt by exact identity, while no completed deed is ever replayed or erased in haste.

## Live reproduction

Released runtime during reproduction: `2eed3f7c0cbc537e68187d8d461adb9b09d155c8`.
Native generation: 3.
Transport: connected until the final stall/restart.
Execution: healthy and continuously completing newer work.
Admission: materially improved; P0/P1/P3 consumers started and the queue remained routable.
Mailbox: degraded, then stalled because one old outbox envelope survived while newer envelopes appeared and drained.

## Exact stubborn record

Mailbox path:
`~/.awtsmoos-tunnel/device-state/awt-awtsmoos-7572-892d7fa43802/.Awtsmoos/connection-mailbox/outbox/e5a49ec41f7805b9c39d44772f73831e5d817257d00742dc126e5e13589e6336.json`

Observed record:
- envelope id: `req_1787881894941_12x8k4uskcdl`
- logical request id: `list-current-thoughts-before-path-plans-103`
- action: `list`
- session: `session-20260826-1702-universal-portal-ui-revelation`
- logical agent: `chatgpt-awtsmoos-shliach`
- updatedAt: `2026-08-28T01:51:37.076Z`
- durable file size at capture: 32,571 bytes

The persisted value is a fully formed successful terminal `TUNNEL_RESPONSE`. It is not unfinished execution. Newer terminal responses entered the same outbox and later disappeared while this exact file/timestamp persisted.

## Failure sequence proven live

1. Newer ordinary actions and control actions continued succeeding.
2. The fixed terminal record aged beyond 60 seconds and mailbox health became `degraded`.
3. `connectionMailboxExport` and `connectionMailboxStatus` entered P0 promptly, proving the newer control admission path is improved.
4. Recovery/status responses themselves temporarily added newer outbox records which later drained; the original record remained.
5. The original record crossed five minutes and mailbox health became `stalled` while execution stayed healthy.
6. The native tunnel disconnected immediately afterward at `2026-08-28T01:57:22.789Z`.
7. Generation replacement cleared the mailbox, but that is not live-generation settlement.

## Post-restart source/release evidence

The next installed release became `2ed0d63673e2c46fd663b89766a91cff9195a878`, now also `origin/main`.
The working tree contains four settlement modules that are **untracked**, therefore absent from that released SHA:
- `child-outbox-settlement-pulse.js`
- `child-outbox-settlement-policy.js`
- `mailbox-acknowledgement-debt.js`
- `mailbox-emergency-settlement.js`

This strongly indicates an unfinished local settlement implementation exists but has not yet reached released main.

## Safety interpretation

This is completion/ACK debt, not evidence that the original `list` action should run again.
Never replay the original action merely to settle its terminal response.
Never delete or quarantine the old response until the exact ACK/removal identity is proven.
Never let stale terminal debt alone authorize destructive generation replacement while transport/execution/parent pulses remain fresh.

## Exact archaeology before a write

Read current full source, local status, and released/origin behavior for:
- the four untracked settlement modules;
- `child-runtime-cycle.js` integration;
- child delivery/send/flush path;
- `child-message-router.js` ACK handling;
- `mailbox.js`, `mailbox-store.js`, `mailbox-io.js`, custody metadata;
- controller/request-acceptance ACK construction;
- existing mailbox identity/settlement tests.

Trace persisted envelope id → outbound terminal envelope → parent/server ACK identity → child ACK handler → exact outbox removal key.

## Regression required

Construct a focused harness that persists terminal result A, withholds or mismatches A's ACK, settles newer B/C, advances A stale, retries only the persisted terminal envelope, then supplies the correct exact ACK and proves A is removed exactly once without replaying its original action. Repeat the ACK to prove idempotence and verify mailbox health becomes healthy without generation replacement.

NEXT_ACTION: read the entire settlement/ACK integration, compare current working tree to released main, then finish the existing local implementation rather than creating a competing design.
