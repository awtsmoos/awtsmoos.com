B"H
# Malchus Right Panel Repair Plan

Chapter 1: The right rail is the palace gate. In the screenshot, the automation/settings sections are clipped because inner panels and scroll containers fight each other: the right column appears fixed-height, nested accordions have hard heights, and controls overflow behind the viewport edge.

Grounded steps:
1. Inspect right-panel CSS and automation panel JS markup.
2. Inspect settings/automation state storage so automation enabled state becomes per chat, not global.
3. Rewrite complete files only; no partial patching.
4. Prefer small targeted full-file rewrites.
5. Verify with search, syntax checks, and browser/runtime probes if available.

Hypotheses:
- CSS issue likely in right-panel-menu.css, panel-controls.css, panels.css, layout.css, automation-cockpit.css, settings-controls-fix.css, or ideal/settings.css.
- Automation leak likely in settingsStore/runStore/panel/backgroundBridge using one global flag instead of chat key.

Success criteria:
- Right panel has one vertical scroll, no clipped sections, accordions can show full content.
- Automation toggle/state is keyed by active chat/conversation id.
- No syntax errors in touched JS.
