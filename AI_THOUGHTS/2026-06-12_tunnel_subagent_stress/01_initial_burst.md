B"H
# Initial Burst: tunnel/sub-agent stress

User asked to inspect Windows `geelooy/apps/tunnel`, stress-test functions, especially suspected broken sub-agent system, and try stored-key MiniMax path.

Known from tunnel: root is `C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com`; target tree contains `agent/lib`, `agent/tools/fs/actionGroups/aiAgents`, UI JS, downloads, and tests at repo root.

Plan phase 1:
1. Inspect aiAgent implementation files, provider discovery, config, client, task runner, child spawner, tool schema catalog.
2. Run non-secret diagnostics: list agents/providers/config public metadata.
3. Try a minimal MiniMax message and record exact failure/success without exposing key.
4. Try spawn/status/result flow with minimal task and inspect whether children/sub-agent family tracking works.
5. Run existing tests or targeted Node checks.
6. If a defect is confirmed and safe to fix, rewrite whole touched files only; otherwise report blockers and exact evidence.

Potential risks: provider key missing, external API unavailable, task runner asynchronous timing, tool action schema mismatch, config migration bug, child limits preventing sub-agents, provider model mismatch.
