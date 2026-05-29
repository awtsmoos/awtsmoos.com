B"H

# Central AI And Editor Tunnel Plan

User asked for three concrete things:
1. Make sure all actions are fully stress tested.
2. Make the code editor optionally become a new tunnel when logged in and configured.
3. Create a generic script/system to stream OpenRouter/Groq/other agents with all local/editor tools connected, while reducing duplicate code between `geelooy/ai` and code editor AI.

Verified current facts:
- Native tunnel live: `awt-u0_a300-26940`.
- Editor browser tunnel already exists at `geelooy/apps/code/js/tunnel/browser-agent.js` and is initialized by `app/bootstrapper.js`.
- Editor settings currently duplicate the Browser Tunnel settings block.
- `browser-agent.js` advertises duplicate `previewControl` keys.
- `geelooy/ai/openaiCompatible.js` already supports OpenRouter and Groq, but only as direct browser chat completion, not as a central reusable tool-connected agent stream.
- `geelooy/apps/code/js/ai` contains agent UI/timeline code but no shared provider/tool bridge.

Implementation direction:
- Add central pure modules under `geelooy/ai/central/` for providers, streaming client, and tool schemas.
- Add Node/local agent runner script under `geelooy/ai/agents/stream-agent.mjs` that can stream OpenRouter/Groq and expose local tunnel/editor tools through a generic bridge.
- Keep existing `geelooy/ai/openaiCompatible.js` API shape but rewrite it to use the central provider modules.
- Split the code editor browser tunnel agent into smaller modules while preserving existing import path and export name.
- Add tests for provider payload generation, tool schema generation, and editor browser tunnel registration shape.
- Extend stress coverage with a manifest classifier: registered, executed-safe, fixture-only, destructive-skipped, chrome-only, external-provider-skipped.

Safety:
- Do not send real requests to OpenRouter/Groq in tests.
- Never read secret files.
- Do not destructively execute dangerous tunnel actions in the real repo.
- All modified files must be complete file rewrites.
