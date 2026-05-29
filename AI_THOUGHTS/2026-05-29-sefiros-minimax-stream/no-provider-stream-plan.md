B"H
# No Provider Stream Cards Plan

The user is right: provider SSE packets are plumbing, not UI events. They must feed visible answer text, thinking, token progress, and tool traces, but must not render as separate PROVIDER STREAM cards.

Observed real bug:
- `openaiCompatible.js` and `multiPassAgent.js` were forwarding every raw MiniMax SSE packet through `providerStreamEvent(...)` into `awtsmoos.otherEvents`.
- The renderer then faithfully displayed those raw chunks as cards, which fragmented the answer and hid the useful things: live text, live thinking, and live tool calls/results.

Fix:
1. Stop adding provider_stream events to visible UI events.
2. Keep reasoning events visible as thinking.
3. Keep tool_call/tool_result/status events visible.
4. Keep raw SSE only inside the provider client for callbacks/metrics, not in message events.
5. Hide old persisted provider_stream events in renderer so stale conversations clean themselves visually after refresh.
