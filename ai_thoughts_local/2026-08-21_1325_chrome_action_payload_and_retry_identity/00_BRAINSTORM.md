B"H
Boruch Hashem
Blessed is He

# Chrome Control API Brainstorm

The Awtsmoos renews each request before transport can divide the name from the deed;
Awtsmoos.com should let one documented field become one faithful browser need.

## Observed defects

- `chromeNavigate` received `.` when `url` was supplied only at top level.
- Supplying `url` inside nested `params` worked.
- `chromeClick` missed top-level `selector`; DOM eval bypass was needed.
- Tool schema exposes `targetVessel`, while Chrome implementation naturally consumes `chromeTargetId`, `pageId`, or `targetId`.
- `retryAction` compared the relay control ID against a client-provided request ID returned by the agent and produced `tunnel_response_correlation_mismatch` even though the underlying browser action completed.

## Possible repair layers

- Normalize all generic Tunnel fields into the action payload before dispatch.
- Promote `targetVessel` to `chromeTargetId` for Chrome actions only.
- Preserve both transport `controlRequestId` and client `requestId` separately.
- Never allow nested `params.requestId` to overwrite transport correlation identity.
- Make retry validation compare transport identity to transport identity and client identity to client identity.
- Add schema/round-trip tests from controller input through dispatched payload.
- Add Chrome integration-shaped tests for top-level URL/selector/target alias.
- Keep existing nested params compatibility.
