<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Discovery Plan: Message Actions and Responsive Layout

## Purpose

Reveal why the per-message action menu is absent, recover relevant historical intent from Git, and map the real rendering and styling path before changing code.

## Evidence to collect

1. Current Git status and recent history for `geelooy/ai`.
2. Historical commits and deleted code mentioning copy, share, audio, video, download, menu, message actions, or stream controls.
3. Current message-rendering modules, DOM structure, event wiring, and CSS selectors.
4. Existing desktop and mobile breakpoints, overflow behavior, panel sizing, and touch-target rules.
5. Existing tests or browser harnesses for message rendering and responsive behavior.

## Discovery outputs

- Exact files responsible for message creation and message interaction.
- Exact historical implementation, when one exists.
- A minimal affected-file graph.
- Risks covering duplicate menus, stale listeners, unsupported media, inaccessible controls, and desktop overflow.

## Verification gate

No implementation begins until the current runtime path and Git history are both grounded in observed files or commands.
