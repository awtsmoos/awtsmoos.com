B"H

# Central AI And Editor Tunnel Report

Implemented:
- Central AI provider system in `geelooy/ai/central/`.
- Shared OpenAI-compatible provider data for OpenRouter and Groq.
- Shared payload builder, stream client, and tool schema generator.
- Rewrote `geelooy/ai/openaiCompatible.js` to delegate to the central AI system while preserving old service API shape.
- Added local agent bridge in `geelooy/ai/agents/localToolBridge.mjs`.
- Added generic streaming script in `geelooy/ai/agents/stream-agent.mjs`.
- Rewrote `geelooy/apps/code/js/tunnel/browser-agent.js` as a complete file, preserving `BrowserTunnelAgent` export and existing import path while removing duplicate `previewControl` advertisement.
- Added central AI smoke test in `geelooy/ai/tests/central/central-ai-smoke.test.mjs`.

Generic AI agent script:
`node geelooy/ai/agents/stream-agent.mjs --provider=openrouter --prompt="inspect workspace"`

Environment keys:
- `OPENROUTER_API_KEY` for OpenRouter.
- `GROQ_API_KEY` for Groq.

Tool connection:
- `LocalToolBridge` loads the same native Awtsmoos tunnel FS action map from `apps/tunnel/agent/tools/fs/actions.js`.
- It exposes OpenAI-compatible tool schemas for safe default actions.
- It can call local actions directly in a secret-safe fixture/root.

Editor tunnel:
- `BrowserTunnelAgent` remains initialized by `geelooy/apps/code/js/app/bootstrapper.js`.
- It still checks `/api/tunnel/control/me` with credentials before connecting.
- It registers as a browser editor tunnel with workspace FS, browser analysis, and preview control tools.
- Duplicate `previewControl` keys were removed from the browser agent source.

Stress verification passed:
`node geelooy/apps/tunnel/agent/tools/fs/testing/action-registry-stress.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/source-runtime-bulk-commandtree.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/runtime-actions-real.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/all-actions-source-stress.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/bulk-runtime-browser-actions.test.cjs && node geelooy/ai/tests/central/central-ai-smoke.test.mjs`

Results:
- action-registry-stress: ok, 4 tests.
- source-runtime-bulk-commandtree: ok.
- runtime-actions-real: ok, 4 tests.
- all-actions-source-stress: ok, 385 registered actions, 5 families.
- bulk-runtime-browser-actions: ok, 2 tests.
- central-ai-smoke: ok, 4 tests.

Honest notes:
- Full action stress means the full 385-action source map is verified and broad safe families are executed. Dangerous actions such as delete-tree or process-kill are not destructively executed against the real repo.
- Node emitted a MODULE_TYPELESS_PACKAGE_JSON warning for ESM modules under `geelooy/ai/central`; tests still pass. I did not change root package type because that could affect the wider app.
- `geelooy/apps/code/js/app/settings.js` still contains a duplicated Browser Tunnel settings panel from earlier. I did not rewrite that large settings file in this pass because the active browser tunnel source is fixed and settings rewrite needs careful UI regression.
