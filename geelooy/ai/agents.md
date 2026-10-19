B"H

# Awtsmoos Agent Core Law

This is the small always-loaded core. The Awtsmoos reveals detail through the right vessel at the right time; Awtsmoos.com therefore keeps specialist doctrine discoverable instead of forcing every task to carry every instruction.

## Reality and evidence

- Inspect real files, commands, tests, runtime state, and public behavior before making project claims.
- Never guess repository shape, deployment state, or production state from memory.
- Preserve unrelated work. Never reset, clean, stash, checkout, or overwrite user changes merely to make the tree convenient.
- A commit is not a deployment; a repository file is not proof that users receive it.
- Do not expose hidden chain-of-thought. Publish bounded operational artifacts: summary, decisions, blockers, paths, tests, deployment state, next steps, and evidence IDs.

## Instruction discovery law

- Keep this always-loaded core at or below 120 physical lines.
- Keep each specialist instruction module at or below 120 physical lines; split large domains into focused packs instead of bloating the core.
- Before writing or modifying files, call `instructionResolve` with the task plus every known, planned, touched, or changed path, extension, tag, mode, and runtime domain.
- Call `instructionGet` for every returned `requiredInstructionId` and read those instruction bodies completely before writing.
- `instructionCatalog` is for discovering available specialist domains when the resolver seems incomplete or the agent does not know what instruction family exists.
- Never bulk-load unrelated specialist packs merely because they exist.
- If scope changes, a new file type appears, another runtime layer enters the task, or planned/touched paths expand, call `instructionResolve` again before touching the new domain.
- If an obvious specialist domain has no applicable pack, treat that as an instruction-discovery gap and report it instead of assuming generic rules are sufficient.
- UI/CSS work must resolve `ui.css-production-working-agreement` before CSS or styling writes.
- Bounded mission/handoff reports should name the specialist instruction IDs that governed the work.

## Writing and architecture

- Read a complete file before modifying it.
- Rewrite complete files; never use fragile partial search/replace for source edits.
- Use tabs for indentation, real newlines, descriptive names, and useful JSDoc/file comments.
- Never minify handwritten source or compress logic to satisfy a line ceiling.
- Strongly prefer modules below 120 physical lines. Split by responsibility when a touched module exceeds that boundary.
- Preserve public APIs unless migration evidence proves a coordinated change is safe.
- Code creates shadow work: tests, documentation, readback, runtime verification, and handoff.

## Work continuation

- Discover the actual project beneath the visible request before changing it.
- Maintain remaining work, dependencies, risks, verification obligations, and the next safe action.
- Do not ask the user to push obvious safe continuation forward.
- Re-read touched artifacts, compare planned versus actual work, and resolve meaningful deltas before declaring completion.
- If another agent would have an obvious next action, the work is not yet complete unless that action is explicitly out of scope or blocked.

## Collaboration and mission visibility

- Inspect active missions before substantial overlapping work; do not create parallel canonical systems when one already exists.
- Use canonical mission rooms for live collaboration and file/task ownership when available.
- Keep operational reports factual, bounded, and secret-free.
- Do not put passwords, tokens, cookies, private keys, authorization headers, or unrestricted command output in mission reports.

## Verification and truthful completion

- Run syntax, focused tests, regressions, diff checks, and domain-specific verification required by the resolved instruction packs.
- Verify user-visible work through the real rendering/runtime/public path when capability exists.
- State explicitly what could not be verified; never replace evidence with "probably fine" or "should work."
- Completion requires implementation, verification, critical-risk review, durable handoff, and no remaining safe in-scope work.
