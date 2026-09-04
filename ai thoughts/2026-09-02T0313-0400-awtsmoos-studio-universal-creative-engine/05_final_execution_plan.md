B"H
Boruch Hashem
Blessed is He

# Final Pre-Implementation Plan — Awtsmoos Studio Foundation Continuation

> One command below, many windows above;
> Awtsmoos.com joins precision with love.

## Goal For This Work Cycle
Establish and, if necessary, repair one verified human/API/AI command path over the existing Nesher Studio canonical project model without disturbing unrelated or pre-existing uncommitted work.

## Read-Only Inspection Set
- `geelooy/apps/nesher-studio/modules/project/Project.js`
- `geelooy/apps/nesher-studio/modules/project/ProjectNormalization.js`
- `geelooy/apps/nesher-studio/modules/project/ProjectValidation.js`
- `geelooy/apps/nesher-studio/modules/creative/state/CreativeProjectState.js`
- `geelooy/apps/nesher-studio/modules/creative/commands/CommandDefinition.js`
- `geelooy/apps/nesher-studio/modules/creative/commands/CommandRegistry.js`
- `geelooy/apps/nesher-studio/modules/creative/runtime/CommandRuntime.js`
- `geelooy/apps/nesher-studio/modules/creative/runtime/installCreativeRuntime.js`
- `geelooy/apps/nesher-studio/modules/creative/history/CreativeHistory.js`
- `geelooy/apps/nesher-studio/modules/creative/history/ProjectTransaction.js`
- `geelooy/apps/nesher-studio/modules/creative/api/StudioCreativeApi.js`
- `geelooy/apps/nesher-studio/modules/creative/api/AiCreativeBridge.js`
- `geelooy/apps/nesher-studio/modules/creative/catalog/stageCommands.js`
- `geelooy/apps/nesher-studio/modules/app/bootNesherStudio.js`
- `geelooy/apps/nesher-studio/modules/ui/mountStudioShell.js`
- relevant current tests and Studio-specific recent planning notes.

## Planned Call-Stack Trace
`bootNesherStudio` → creative runtime install → registry → command definition → runtime execution → parameter validation → transaction → canonical project mutation → history → API/AI evidence → UI refresh.

## Source Mutation Gate
No source file is approved for mutation yet. After inspection, the exact minimal file list will be written into a new plan artifact before any rewrite. Existing dirty files will only be touched if the current whole-file content is fully read and incorporated.

## Verification Gate After Any Code Pass
1. Syntax/static check for every touched JS module.
2. Targeted creative runtime unit/integration tests.
3. Project serialization check after command execution.
4. Undo/redo round trip.
5. Manual command/API/AI parity check on resulting project JSON.
6. Browser launch of Nesher Studio with console inspection.
7. Mobile viewport interaction proof for the touched intent.
8. Re-read all touched files and compare PLANNED vs ACTUAL.

## REMAINING_WORK
- Inspect current Studio architecture and provenance.
- Identify exact vertical-slice gap.
- Write post-inspection exact mutation manifest.
- Implement with whole-file rewrites only if a real gap exists.
- Verify model/integration/browser/mobile/history/serialization/parity.
- Write post-pass delta and handoff artifacts.

## NEXT_ACTION
Run a scoped architecture read and diff-stat over Nesher Studio only; do not mutate source.
