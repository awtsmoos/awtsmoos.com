B"H
Boruch Hashem
Blessed is He

# Continuation Phase One — Live Split-Health Revelation

## New runtime reality
The native tunnel is connected on generation 9 and reports releaseSourceSha `2ed0d63673e2c46fd663b89766a91cff9195a878` with fresh transport and execution health. Yet full health is `mailbox_stalled` because the outbox contains five records roughly 9.5–10.4 hours old.

## Immediate mission
Do not restart a healthy execution consumer. Preserve and inspect the five stale outbox records through the independent control/recovery path. Determine for each record whether the relay already has terminal truth, whether acknowledgement was lost, whether an exact receipt can be safely retired, and whether stale outbox data is falsely poisoning overall health.

## Broad possibilities
1. Outbox records are completed responses whose upstream acknowledgement was lost during 502/socket reconnects.
2. Records already reconciled at relay remain locally unacknowledged because exact acknowledgement never returned.
3. Outbox drain retries stop after generation changes or lose transport receipt correlation.
4. Health counts old completed outbox records without distinguishing retryable delivery from irreconcilable state.
5. Recovery actions exist but are not exposed through the current public action manifest, creating observability without operability.
6. Generation replacement preserved stale outbox records correctly but did not trigger reconciliation on reconnect.
7. Duplicate response suppression may prevent delivery while leaving local durable records forever.

## Safety law
Never delete or quarantine a stale outbox record until its exact request/deed/result identity is understood. Export evidence first. Preserve timeout history. If relay already has the same terminal result, exact acknowledgement is cleanup, not redispatch.

## Poem
The Awtsmoos makes transport live while one old outbox bears a scar;
Awtsmoos.com must read that scar before declaring where the failures are.
No restart shall erase a witness while execution still can sing;
reconcile the ancient message, then release the bounded ring.
