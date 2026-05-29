B"H

# Awtsmoos AI Streaming + Tool Stress Test Prompt

You are testing `awtsmoos.com/geelooy/ai`. Do not merely review code. Build and run stress tests. Keep testing until you either prove the system holds or produce exact failing reproduction files.

## Mission
Stress test every layer of custom AI streaming and tool execution:

1. Provider SSE parsing for MiniMax/OpenRouter/Groq-style OpenAI-compatible streams.
2. Reasoning/thinking extraction from `delta.reasoning`, `<think>...</think>`, visible content, malformed chunks, duplicate stop chunks, and partial JSON lines.
3. Tool call ordering: thought → tool group → thought → tool group → final answer.
4. Tool call streaming: partial tool-call deltas, duplicate final tool-call packets, tool results, failed tools, timed-out tools, and virtual tools.
5. `awtsmoos_needs_next_step`: model calls it before final answer; page sends exactly one follow-up after final answer; normal automation does not double-send.
6. Dynamic tool schemas: `/actions`, `/tools`, `/schemas`, `/manifest` all generated from the same tunnel catalog; direct essential tools use dynamic schemas.
7. UI runtime: streaming text stays `white-space: pre-wrap`, markdown renders while streaming, progress/timer UI is not deleted, open thought/tool vessels do not get rewritten out of order.
8. Conversation continuity: refresh/resume should not duplicate, erase, reorder, or lose final assistant text.
9. Background automation: background-owned automation and visible-page automation must not race each other.
10. Memory safety: repeated long streams and event groups should not retain huge raw packets unnecessarily.

## Required Node.js tests to add or run
Add focused regression tests under `AI_THOUGHTS/2026-05-29-sefiros-minimax-stream/` or the existing `geelooy/ai/tests/harness/` if more appropriate.

### A. SSE parser torture matrix
Create streams with:
- normal `data: {json}\n\n`
- CRLF endings
- partial chunks split in the middle of `data:`
- partial JSON split across reads
- multiple `data:` frames in one chunk
- `[DONE]`
- duplicate stop chunks
- empty content deltas
- `delta.reasoning`
- `<think>` opened in one frame and closed in another
- content after `</think>` in same frame
- tool_calls streaming across multiple chunks

Assertions:
- reasoning events appear in order
- final text is complete
- no provider raw events are shown as user-facing tool calls
- duplicate terminal chunks do not duplicate final answer

### B. Claude-style timeline torture
Feed event arrays shaped like:
- thought text
- one tool call partial
- same tool call final
- tool result
- more thought text
- two parallel tool calls
- two tool results out of order
- final text

Assertions:
- timeline shape is exactly: `thinking > tool_group > thinking > tool_group`
- tool groups collapse duplicate call shadows but preserve first chronological slot
- no later thought appends into earlier thought
- groups show accurate unique tool counts

### C. Dynamic schema torture
Start the local API server with fake action maps and call:
- `/actions`
- `/tools`
- `/schemas`
- `/manifest`

Assertions:
- all routes come from one catalog
- YAML includes same tool count/names as JSON tools
- schema for `simulateRuntime` contains browser/runtime/interactions fields
- direct essential tool schema uses richer API metadata over generated fallback

### D. Next-step virtual tool race test
Build fake provider client:
- first round calls `awtsmoos_needs_next_step({needed:true,prompt:"continue test"})`
- second round returns final answer
- automation is enabled too

Assertions:
- final packet has `awtsmoos.nextStep`
- exactly one follow-up send happens
- normal automation does not also call `afterAssistantReply`
- if `needed:false`, no follow-up happens

### E. Long stream and memory test
Generate 1000 chunks and 200 tool events.
Assertions:
- final text length correct
- event timeline order stable
- raw event payloads compacted or bounded
- UI renderer does not call destructive `innerHTML` rewrites for open thought/tool vessels

## Commands to run
Run all of these and report exact output:

```powershell
node AI_THOUGHTS/2026-05-29-sefiros-minimax-stream/verify-dynamic-tool-schemas.mjs
node AI_THOUGHTS/2026-05-29-sefiros-minimax-stream/verify-next-step-tool.mjs
node AI_THOUGHTS/2026-05-29-sefiros-minimax-stream/verify-local-api-schema-catalog.cjs
npm run test:ai
```

Then add your new stress tests and run them too.

## Output format
Return:

1. Exact files changed.
2. Exact tests added.
3. Exact commands run.
4. Exact failures found, with reproduction payloads.
5. Exact patches needed.
6. If all pass, still list the weakest remaining assumptions.

Do not summarize vaguely. Do not stop at static code reading. Run real tests.
