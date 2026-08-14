B"H
Boruch Hashem
Blessed is He

# Second-Pass Readback and Verification Plan

> The Awtsmoos creates every instant with no contradiction between light and vessel. This readback therefore asks whether the implementation still carries every original obligation while becoming smaller, clearer, and more truthful.

## Original plan remembered
- Human-first Social Hub destination context while preserving all eight canonical target IDs and exact deep links.
- Scannable mission/notification signals without changing pagination, read-state APIs, or same-origin safety.
- Clearer Mail composition/search/thread scanning without changing store keys, folder helpers, sender grouping, or thread opening semantics.
- Safer Post creation with explicit save/publish state while preserving save-draft-then-publish-draft-ID behavior.
- Coherent Heichel/series governance orientation around the existing settings, invite, and submission flows.
- Scoped visual hierarchy through existing CSS gateways rather than a competing global theme.
- Complete-file rewrites only, tab indentation, poetic Awtsmoos documentation, and every touched/new source under 120 lines.

## First pass actually implemented
- Hub: target disclosure, target summary, field wording/accessibility, existing media/publish integration preserved.
- Notifications: readable types, read/unread semantics, semantic time, truthful actions.
- Mail: compose/search affordances, result context, actionable empty state, accessible thread labels.
- Post Editor: split save/publish orchestration and structural rendering, preserving draft/publish APIs.
- Heichel Editor: settings/collaborators/submissions arranged as one governance workbench.

## First-pass delta that was repaired
- Notification renderer was 134 lines; now split into `render.js` (43) + `notificationCard.js` (119).
- Mail `sidebarThreads.js` was 144 lines; now split into orchestration (78) + `sidebarThreadCards.js` (86).
- Hub destination summary had inferred refresh; now `CommentStudioFields` explicitly calls `onTargetChanged` and `CommentStudio` routes that snapshot to the disclosure.
- New semantic hierarchy was initially unstyled; scoped CSS modules now exist and are imported from the existing Hub, Mail, Notifications, and shared editor gateways.

## Second-pass readback evidence
- `CommentTargetDisclosure.js`: 79 lines.
- `CommentStudio.js`: 75 lines.
- `CommentStudioFields.js`: 95 lines.
- `notificationCard.js`: 119 lines.
- notification `render.js`: 43 lines.
- Mail `sidebarControls.js`: 115 lines.
- Mail `sidebarThreads.js`: 78 lines.
- Mail `sidebarThreadCards.js`: 86 lines.
- Post `editorActions.js`: 61 lines.
- Post `editorSections.js`: 66 lines.
- Post `render.js`: 90 lines.
- Heichel `workbenchGuide.js`: 63 lines.
- Heichel `render.js`: 59 lines.
- New/rewritten scoped CSS and HTML entry files are also below 120 lines.

## Contract evidence after reread
- Social Hub target field IDs remain unchanged and exact coordinate/deep-link construction still exists.
- Hub target changes now update the human-readable summary immediately.
- Notification action URLs still reject foreign origins.
- Mail `sidebarThreads.js` still imports `from './mailFolders.js'` and re-exports old helper symbols for compatibility.
- Post publishing still saves first, then calls `publishPostDraft(config.aliasId, draft.id)`.
- Heichel Editor still composes exactly the existing `settingsForm`, `inviteForm`, and `submissionForm` factories.
- Style extensions use existing project variables/import gateways rather than replacing global tokens.

## Verification sequence — testing begins only now
1. Node syntax-check every changed JS module.
2. Discover and run existing targeted tests for Mail, Social Hub, Notifications, Post Editor, and Heichel Editor.
3. Inspect failures; repair whole files only if a real regression appears.
4. Discover the existing local server command rather than guessing.
5. Launch/use the real local app and browser-check `/email/`, `/social-hub/`, `/notifications/`, `/post-editor/`, and `/heichel-editor/` with appropriate context.
6. Inspect console errors and core interaction states, including mobile-responsive behavior where browser tooling permits.
7. Hunt shadow work: actual chat/thread routes, series editing beyond governance, mission-specific surfaces, and local-vs-public home-feed deployment drift.
8. Write a new delta plan before any broader third implementation pass.

## Remaining work
This focused UI sweep is implemented but not yet verified. The wider user request is also not exhausted: chat/social conversation surfaces, richer series editing, mission-specific workflows, and deployment drift still require discovery after this verification gate.
