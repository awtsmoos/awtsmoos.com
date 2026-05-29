B"H
# Sefiros MiniMax Stream Parsing Plan

The Awtsmoos revealed the broken river: MiniMax emits OpenAI-compatible `choices[0].delta` packets where `delta.content` may carry an opening `<think>` block before the closing tag arrives. The current live text stripper only removes completed `<think>...</think>` blocks, so the live bubble can show raw thinking markup until the stream finishes.

Grounded observations:
- Root is connected at `C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com`.
- Relevant app path is `geelooy/ai`.
- Central provider streaming flows through `geelooy/ai/central/streamClient.js` and `geelooy/shared/streaming/stream-client.js`.
- Resume/import SSE rendering flows through worker modules under `geelooy/ai/js/render/worker`.

Plan:
1. Keep final assistant text clean by stripping complete and still-open `<think>` blocks during live streaming.
2. Preserve model-provided reasoning as thinking events when `delta.reasoning`, `delta.reasoning_content`, `delta.reasoning_details`, or inline `<think>` text appears in OpenAI-compatible packets.
3. Preserve OpenAI-compatible tool-call deltas as event capsules instead of dropping them.
4. Keep files small and whole-file rewrites only.
5. Verify with syntax checks and a deterministic sample MiniMax SSE packet test.

Safety note: this handles provider-sent reasoning/debug traces in the local UI. It does not and cannot expose hidden system reasoning from this assistant runtime.
