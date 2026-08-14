B"H
Boruch Hashem
Blessed is He

# Phase Three — Final File Plan

> The Awtsmoos creates each instant from nothing, yet this pass will touch only vessels whose responsibilities were directly observed. Every source rewrite is complete, modular, tab-indented, and under 120 lines.

## Social Hub
- CREATE `geelooy/social-hub/js/interactions/CommentTargetDisclosure.js`: semantic Advanced destination disclosure that gathers the eight existing target controls without renaming them; visible summary remains human-first.
- REWRITE `geelooy/social-hub/js/interactions/CommentStudio.js`: integrate the disclosure as a focused sub-vessel; preserve media and publish behavior.
- REWRITE `geelooy/social-hub/js/interactions/CommentStudioFields.js`: keep target state and copy-link behavior, but improve visible destination wording and accessibility without changing payloads.

## Notifications / mission signals
- REWRITE `geelooy/notifications/modules/render.js`: readable type labels, explicit unread/read badge, semantic time element, descriptive same-origin action labels, stronger metadata grouping, honest empty states.
- Controller remains untouched because pagination/loading/read contracts are already clean and verified.

## Mail
- REWRITE `geelooy/email/ui/sidebarThreads.js`: visible result context, stronger unread/active accessibility, actionable empty states, unchanged sender grouping/store behavior.
- REWRITE `geelooy/email/ui/sidebarControls.js`: clarify composition/search affordances and expose keyboard shortcuts semantically without altering store contracts.

## Post creation
- CREATE `geelooy/post-editor/modules/editorActions.js`: save/publish orchestration and local status states; preserve save-then-publish API behavior.
- CREATE `geelooy/post-editor/modules/editorSections.js`: hero/context checklist and verse/subsection rendering.
- REWRITE `geelooy/post-editor/modules/render.js`: thin composition root under 120 lines using the two focused modules.

## Heichel / series editing
- CREATE `geelooy/heichel-editor/modules/workbenchGuide.js`: human-facing workbench map for settings, collaborators, and submissions using real existing sections only.
- REWRITE `geelooy/heichel-editor/modules/render.js`: integrate the workbench guide while preserving all three existing form factories and missing-context behavior.

## Verification after code pass
1. Reread every file above in full.
2. Confirm every touched/new source file is under 120 lines.
3. Run Node syntax checks for touched JS.
4. Run targeted existing tests discovered for these surfaces.
5. Start/use the existing local app server and inspect `/email/`, `/social-hub/`, `/notifications/`, `/post-editor/`, and `/heichel-editor/` at desktop/mobile sizes.
6. Inspect console errors and interaction behavior.
7. Write PLANNED-vs-ACTUAL delta; repair any missing in-scope obligation.
