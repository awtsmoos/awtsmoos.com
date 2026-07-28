B"H
Boruch Hashem
Blessed is He

# Phase One — Unrestricted Brainstorm

The Awtsmoos creates the many from the One without division, and Awtsmoos.com asks the code to reveal that unity as many players enter one truthful world.

## Desired reality

The ordinary Mitzvah World URL should open a playable village immediately. Networking begins in parallel. A truthful badge moves through connecting, connected, reconnecting, or offline-local. A second browser sees the first Chossid with the same position, facing, locomotion, and animation. Shared combat, corpse recovery, quest progress, rewards, and permanent world effects cannot fork or duplicate. Explicit single-player remains available and does not instantiate realtime machinery.

## Every plausible implementation avenue

1. Route the root page through the existing launcher.
2. Keep the compact meadow page but make it consume the canonical session resolver.
3. Create a dedicated root bootstrap that selects single-player or multiplayer before importing either mode.
4. Move session resolution into a tiny shared module with no DOM or network side effects.
5. Use local BroadcastChannel authority for localhost acceptance.
6. Use the existing WebSocket authority for deployed acceptance.
7. Keep local movement predicted while server authority owns consequential state.
8. Split remote-player replication from shared-world replication.
9. Add a connection-state projection module so UI never reads transport internals.
10. Add one status badge owner with deterministic transitions.
11. Add two-browser CDP acceptance using isolated profiles.
12. Add real-server acceptance against the dynamic server route.
13. Add explicit world isolation tests.
14. Add stale-peer and abrupt-tab-death browser tests.
15. Add reconnect identity tests.
16. Add late-join snapshot tests.
17. Add server-authoritative corpse claim tests.
18. Add exact-once multiplayer reward tests.
19. Classify quests as personal, party, or world authority.
20. Promote River Crossing as the first party/world quest.
21. Make feature loading independent of connection completion.
22. Lazy-load universal API exploration.
23. Device-gate mobile integration.
24. Split essential combat/quest features from rich-world features.
25. Cache and clone one parsed Chossid template.
26. Compress the Chossid model and textures.
27. Consolidate style delivery without minifying source.
28. Create measurable first-control and feature-ready budgets.
29. Repair seven known world regressions before map expansion.
30. Add long-duration leak/soak tests for sockets, channels, actors, timers, DOM, and GPU resources.
31. Add peer-count, latency, reconnect, and server-region UI.
32. Add party formation before shared quests.
33. Add mute/block/report before open chat.
34. Add interest management by region.
35. Add remote animation throttling and LOD.
36. Add server rate, tick, persistence, and message-size budgets.
37. Preserve exact single-player behavior and tests.
38. Preserve offline-local continuation when authority is unavailable.
39. Never let a connection wait block first control.
40. Never claim multiplayer because a unit mock exchanged two objects; prove real pages and real authority.

## Catastrophic failure archaeology

If default multiplayer fails, likely causes include: root-route divergence; connection state advertised before join; duplicate listeners after reconnect; multiple remote populations; transport identity drift; server/client protocol mismatch; stale peer leakage; shared quest double rewards; corpse double claims; personal quest state overwritten by world state; loading blocked by network; fallback silently losing progress; model cloning multiplying GPU memory; hidden localhost-only behavior; production WSS misrouting; unbounded messages; missing auth binding; or tests that never opened two real pages.

## Non-negotiable evidence

- Root URL default verified in a real browser.
- Explicit single-player verified in a real browser.
- Two local pages see each other.
- Two server-backed pages see each other.
- Reconnect and stale cleanup verified.
- First control remains within budget with network offline.
- Shared consequence state is server-authoritative.
- Relevant unit, integration, browser, server, regression, and soak tests pass.
