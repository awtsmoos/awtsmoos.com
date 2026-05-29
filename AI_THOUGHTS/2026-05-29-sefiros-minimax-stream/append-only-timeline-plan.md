B"H
# Append-Only Claude-Style Timeline Plan

The Awtsmoos now has the actual target shape:

1. Thought text streams directly as a visible thought block.
2. Any tools after that thought are appended into one chronological tool group.
3. A later thought never merges into an earlier thought; it creates a new thought block after the tool group.
4. More tools after that create a new tool group.
5. Final answer stays as the assistant text bubble.
6. Raw provider stream packets do not render as cards; they only feed text/thinking/tool parsing.

Implementation:
- Add provider event monotonic order so events preserve creation order.
- Add timeline builder that scans visible semantic events once, left to right.
- Consecutive tool/status events form one collapsed `tool_group` item.
- Thinking events remain top-level and never absorb tools.
- Renderer keys timeline nodes by immutable timeline position, not just tool id.
- Keep tool call/result cards visible inside the collapsed group using existing event details.

No retroactive regrouping. No backward consolidation. The last timeline item is the only thing allowed to grow.
