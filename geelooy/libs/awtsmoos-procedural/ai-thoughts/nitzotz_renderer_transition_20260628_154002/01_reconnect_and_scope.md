B"H
# Phase 1 — Reconnect and Scope

User reports screenshot evidence: geometry is now visible but distorted/incorrect, purple slabs and world meshes overwhelm camera. The old Android tunnel is gone; use the live Mac tunnel. Priority shifts from pure nitzotz renderer triage toward geelooy/libs/awtsmoos-procedural as the reusable procedural geometry library.

Evidence required before edits:
- Locate awtsmoos-procedural library.
- Read its package/files.
- Read nitzotz references to procedural/world/chunks/geometry.
- Find how game currently consumes procedural mesh data.
- Improve library without adding rendering frameworks.

No fragment patching. Any touched source file must be rewritten fully.
