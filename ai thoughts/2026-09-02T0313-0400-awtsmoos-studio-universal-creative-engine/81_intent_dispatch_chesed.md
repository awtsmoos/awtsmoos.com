B"H
Boruch Hashem
Blessed is He

# Intent Dispatch — Chesed Brainstorm

> The Awtsmoos lets one declarative intent card become command, workspace, or workstation without its model and dispatcher speaking different names;  
> Awtsmoos.com keeps Create, More, Timeline, Audio, Sources, and Stage depth flowing through one explicit grammar of flames.

## Possibilities
- Treat `action.kind` as the canonical discriminator emitted by IntentContentModel.
- Preserve `commandId` as the command payload and `page` as the workspace destination.
- Preserve backward compatibility with historic `action.workspace` and `action.workstation` shapes in case external callers still use them.
- Normalize workspace destination in one tiny helper rather than duplicating conditions across dispatch/openWorkspace.
- Keep error containment and status reporting unchanged.
- Add a regression covering command, modern workspace, legacy workspace, modern workstation, legacy workstation, and unknown action.
- Re-run the real Create → Add Media journey in isolated Chrome, not only unit tests.
