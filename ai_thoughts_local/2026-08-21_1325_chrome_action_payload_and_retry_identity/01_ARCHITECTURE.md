B"H
Boruch Hashem
Blessed is He

# Chrome Control API Architecture

The Awtsmoos lets transport identity and action parameters dwell in neighboring but separate rooms;
Awtsmoos.com keeps the relay covenant stable while browser fields arrive in their documented blooms.

## Inspection targets

- Tunnel control request parser / payload mapper.
- Agent dispatch envelope builder.
- Tool schema generation for Chrome actions.
- Response correlation validator.
- Retry registry / retry response path.
- Existing correlation and Chrome-action tests.

## Preferred architecture

1. A small action-input normalizer receives the controller body.
2. It merges explicitly supported top-level action fields into the dispatched action payload without overwriting explicit nested payload values.
3. Chrome alias mapping converts `targetVessel` into `chromeTargetId` only when no explicit Chrome target ID exists.
4. Request IDs remain layered: transport-generated `controlRequestId`; optional client `requestId`/`clientRequestId` for idempotency/tracing.
5. Response correlation never substitutes client request identity for the transport control identity.
6. Retry records retain the original control identity and action; polling does not manufacture a second expected identity.

## Compatibility

- Nested `params` continues to work.
- Existing direct agent callers continue to work.
- No action-specific browser behavior changes.
- No target lease weakening.
