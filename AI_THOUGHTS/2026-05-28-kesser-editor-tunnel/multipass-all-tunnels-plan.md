B"H

# Multipass All Tunnels Plan

User challenged the previous central AI work: OpenRouter/Groq must use all tools for all tunnels, including virtual machine / virtual OS tunnel and code editor tunnel, even for models that do not support native function calls.

Verified gap:
- `OpenAICompatibleStreamClient` sent `tools` in payload but did not execute model tool calls.
- `stream-agent.mjs` streamed one pass only.
- `LocalToolBridge` exposed only one native local source action bridge.
- Browser editor tunnel exists.
- Virtual OS does not yet register as a tunnel.

Implementation plan:
1. Add a generic all-tunnel registry module that can combine native/local, editor/browser, and virtual-os tunnel descriptors into one tool namespace.
2. Add a multipass tool loop that supports two paths:
   - Native OpenAI tool_calls from models that support functions.
   - Text fallback blocks for models that do not support functions.
3. Fallback protocol: model emits JSON block with `{ "awtsmoos_tool_calls": [{ "name": "read", "arguments": { ... } }] }`; runner executes tools, appends results, then calls model again until final answer or max rounds.
4. Update stream-agent.mjs to use the multipass loop instead of single request.
5. Add virtual OS tunnel agent that registers if logged in and enabled, with safe OS actions.
6. Add tests with fake providers proving:
   - tool schemas include namespaced tools.
   - fallback JSON tool call executes and loops twice.
   - native tool_calls execute and loop.
   - virtual OS tunnel registration packet shape is available.

Safety:
- No real OpenRouter/Groq requests in tests.
- Default multipass max rounds finite.
- Tool calls remain local, secret-safe, and action-gated.
