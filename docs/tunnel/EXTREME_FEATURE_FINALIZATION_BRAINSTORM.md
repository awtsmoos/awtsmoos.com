B"H
Boruch Hashem
Blessed is He

# Extreme Feature Finalization Brainstorm

This is the next feature-finalization map for Awtsmoos Tunnel, Virtual OS, apps/code, geelooy/os, previews, storage, live activity, and rent-a-tunnel. It is not a claim of completion. Each item needs isolated stress tests and live verification.

## North star

Awtsmoos should feel like one living vessel system:

- Native tunnel exposes a local workspace safely.
- Virtual OS exposes a hosted workspace without installing anything.
- apps/code acts as its own workspace/tunnel surface for AI and humans.
- geelooy/os acts as the visual shell over the user’s Awtsmoos storage, tunnels, previews, agents, and live activity.
- Preview links can show generated pages, file collections, folders, action results, local servers, and storage snapshots.
- AI activity appears live: what files it is reading, what actions it is about to call, what previews it created, what storage it touched, and what agents are running.
- Rent-a-tunnel/federation turns optional user machines into permissioned vessels with peruta metering, capability declarations, and revocable routing.

## Highest-value finalization features

1. **Persistent preview store**
   - Current preview IDs can disappear on server restart if stored in memory.
   - Store previews in user-scoped persistent storage with TTL cleanup.
   - Stress: create preview, restart server, view still works until TTL expires.

2. **Preview source replay**
   - Every preview should store the action/source that created it.
   - If a preview was generated from dynamic files or localhost proxy, it should say whether it is replayable or live-only.
   - Stress: preview page, preview collection, preview folder, preview action result, preview localhost proxy.

3. **apps/code workspace vessel**
   - apps/code should be able to select a workspace backed by native tunnel, Virtual OS, or local browser storage.
   - It should use the same action schema as ChatGPT tunnel actions.
   - Stress: open code app, select Virtual OS, write/read/list/search/preview using same action surface.

4. **Virtual OS storage parity**
   - Virtual OS must support list/read/write/bulkWrite/search/pathHints/preview actions with consistent response shapes.
   - It should clearly mark unsupported actions like native shell commands.
   - Stress: compare native tunnel vs Virtual OS action families and response contracts.

5. **Live activity websocket hub**
   - Every action emits lifecycle events: queued, started, tool-called, file-read, file-written, preview-created, command-output-page, completed, failed.
   - apps/code, tunnel-control, and geelooy/os subscribe to the same stream.
   - Stress: fake 100 concurrent action events and verify UI drains without freezing.

6. **AI agent visibility panel**
   - Show which AI agents/subagents exist, their current tasks, last action, next planned action, opened files, previews, and peruta cost.
   - Stress: spawn mock task, stream events, cancel, verify timeline.

7. **Storage explorer with permission narration**
   - geelooy/os should show Awtsmoos storage, Virtual OS files, action artifacts, preview artifacts, and AI thoughts as separate mounts.
   - Stress: create files in each mount, verify tree/search/preview, verify secret denial.

8. **Rent-a-tunnel marketplace**
   - Capability registry: CPU, RAM, GPU, browser, filesystem roots, allowed actions, region, price, availability.
   - Matching engine: request action family and budget, route to eligible vessel.
   - Audit: every rented action has owner, renter, cost, duration, artifacts, and revocation.
   - Stress: simulate three vessels, route read/browser/compute jobs, revoke one mid-run.

9. **Capability contracts**
   - Each vessel publishes exact action support and limits.
   - UI must not show unsupported actions as if they work.
   - Stress: native vs virtual vs browser-device matrix.

10. **No-504 everywhere**
   - Command already moved toward async jobs; preview/render/browser and giant searches should use jobs/artifacts too.
   - Stress: huge command, huge preview collection, huge search, huge file read, giant action result.

11. **Login and onboarding polish**
   - apps/code, tunnel-control, geelooy/os should share a clean OAuth/login state component.
   - Explain three modes: Native Tunnel, Virtual OS, Browser Workspace.
   - Stress: logged out, logged in no tunnel, logged in native tunnel, logged in Virtual OS only.

12. **Realtime peruta meter**
   - Show cost estimate before each action and live charge after completion.
   - Stress: action families return usage/peruta metadata and UI renders it.

13. **Workspace snapshots**
   - One-click snapshot of current workspace/storage/action artifacts/previews.
   - Stress: snapshot, mutate, restore or compare.

14. **Subagent full access audit**
   - Every AI surface must call a central action client, not hand-coded stale payloads.
   - Stress: subagent tries bulkWrite XML/JSON, commandStart, previewPage, pathHints, Virtual OS write.

15. **Visual quality pass**
   - geelooy/os and apps/code need polished layouts, clearer tabs, live feeds, storage explorer, preview cards, and error cards.
   - Stress: screenshot desktop/mobile breakpoints and compare visible panels.

## Continued execution map

The stress-test architecture, implementation order, magical UX targets, known risks, and definition of done continue in [EXTREME_FEATURE_FINALIZATION_CONTINUATION.md](EXTREME_FEATURE_FINALIZATION_CONTINUATION.md).
