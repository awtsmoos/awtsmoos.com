B"H
# Real-Time MiniMax Event Stream Plan

The user showed a live MiniMax request where the browser sends 422 tunnel tools and MiniMax streams OpenAI-compatible SSE chunks with `choices[0].delta.content` and `choices[0].delta.reasoning`.

Fresh diagnosis:
- The provider client parses the SSE and streams text/reasoning/tool callbacks, but it does not expose every raw SSE packet as a visible event.
- The direct and multipass provider wrappers only know about `onDelta`, `onReasoning`, and `onToolCall`.
- Therefore many stream facts are invisible: raw chunk arrival, finish_reason chunks, usage/meta frames, and duplicate stop packets.
- The tool payload is huge because `BrowserLocalTunnelBridge` discovers `/actions`, then `DEFAULT_TOOL_LIMIT` is 500, so up to 500 actions become individual OpenAI tools. The screenshot shows 422 discovered actions.

Fix now:
1. Add a generic provider raw event helper with compact raw packet shape.
2. Make `OpenAICompatibleStreamClient` accept `onEvent` and forward real-time raw SSE/meta/finish events.
3. Make direct and local-tool paths attach those events to the visible assistant packet immediately.
4. Keep visible text streaming clean from `<think>` while thinking remains visible as events.

Brainstorm only for tool payload later:
- Category router: expose 8-15 tools like `fs`, `search`, `runtime`, `browser`, `http`, `git`, `test`, `workflow`, with an `action` enum/string inside args.
- Dynamic tool manifest: first request sends a tiny `tool_catalog` plus one dispatcher; the model asks for a category/action when needed.
- Capability tiers: default read/debug tier only; write/destructive/server/http tools opt-in per chat.
- Provider-aware caps: MiniMax gets fewer tools because huge schemas delay streaming and weaken tool selection.
- Action aliases: merge duplicate actions such as `grep`/`rg`/`bulkSearch`, `nodeCheckMany`/`nodeCheckFiles`, `read`/`readLines`/`read64`, static-server family, cookie/http families.
