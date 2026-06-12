B"H
# Fix Plan: AI Payload Fusion

Problem observed:
- `aiAgentMessage` with JSON in `content` works.
- Top-level/tool-direct fields are not reliable for other agents because schemas/routes may not preserve or advertise them.
- `params` can become `{}` or be misunderstood by the caller layer.

Planned full-file rewrites:
1. `geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgentActions.js`
   - Merge parsed JSON from all carrier fields instead of first one only.
   - Treat plain content/text/body/query/goal as a message when no JSON is present.
   - Add aliases: `providerId`, `agent`, `prompt`, `message`, `taskId`, etc.
   - Return list metadata that documents supported easy payload carriers.

2. `geelooy/apps/tunnel/agent/lib/tool-schema-catalog.js`
   - Add an AI-specific schema for `agent` and `aiAgent*` actions.
   - Explicitly expose top-level `provider`, `agentId`, `message`, `prompt`, `model`, `stream`, task limits, and JSON carrier fields.

Verification:
- Node-check both rewritten files.
- Use direct module tests for actionPayload.
- Re-run public `aiAgentMessage` via `content`.
- Re-run schema catalog trace or list and verify AI schema surface.

No secrets will be printed.
