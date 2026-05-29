B"H

# Kesser Editor Tunnel Plan And Findings

The inspected root is `/storage/emulated/0/Documents/git/awtsmoos.com`.

Visible target roots:
- `geelooy/API/tunnel`
- `geelooy/apps/tunnel`
- `geelooy/apps/code`
- `geelooy/os`

Immediate verified findings:
1. Live local tunnel is connected as `awt-u0_a300-26940`.
2. `actionRegistrationReport` exists in the API-side route source tree, but the live local agent does not register that action.
3. The command-class tunnel action is `commandRun`; plain `command` returns `unknown_command_action`.
4. Built-in action registry stress test passed 4 tests.
5. `source-runtime-bulk-commandtree.test.cjs` failed because `VirtualWindow` constructs `BrowserRenderPipeline` when the UMD branch has not loaded that class.
6. `geelooy/apps/code/js/app/settings.js` contains a duplicated Browser Tunnel Agent settings panel.
7. `geelooy/apps/code/js/tunnel/browser-agent.js` already implements the browser-tab tunnel path and advertises browser workspace filesystem, browser analysis, and preview control capabilities.
8. The browser agent `tools()` object contains duplicated `previewControl` keys.

Safe next repairs:
- Add aliases `command` and `runCommand` to the command action dispatcher so ChatGPT/tool schema wording works.
- Make `VirtualWindow` resilient when the retained render pipeline is not loaded in UMD mode.
- Verify syntax and rerun the failing source/runtime/bulk/command-tree test.

Broader architecture direction:
- Keep native Node tunnel for command/chrome/http features.
- Keep browser editor tunnel for workspace FS and preview control.
- Add a unified browser-safe runtime action layer only where the browser can actually simulate it.
- Do not pretend browser pages can execute native shell or inspect arbitrary host files without a native tunnel.
