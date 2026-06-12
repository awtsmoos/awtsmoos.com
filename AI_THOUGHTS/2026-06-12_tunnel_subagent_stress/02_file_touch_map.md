B"H
# File Touch Map

Candidate read files:
- geelooy/apps/tunnel/agent/lib/config.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgentActions.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/providers.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/taskRunner.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/childSpawner.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/store.js if present
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/registry.js
- geelooy/apps/tunnel/agent/lib/tool-schema-catalog.js
- package.json and relevant tests

Candidate write files only if confirmed defect exists. No partial patching; full rewrites only.

Stress targets:
- aiAgentList
- aiAgentMessage
- aiAgentSpawnTask
- aiAgentTaskStatus
- aiAgentTaskResult
- aiAgentTaskList
- consolidated `agent` action if present
- provider key lookup path for MiniMax.
