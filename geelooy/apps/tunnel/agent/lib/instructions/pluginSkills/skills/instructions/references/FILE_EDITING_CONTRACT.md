<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
## Current tunnel integration takes precedence

This reference retains the user's original ideas. Its historical transport names, fixed action lists,
local thought-folder defaults, retry assumptions and installation advice are superseded by
MODERN_TUNNEL_CONTRACT.md and the current authenticated instructionResolve/instructionGet results.
Use tunnel-native plans and bounded operational summaries; do not publish hidden chain-of-thought.
Treat brainstorming as proposals, not authorization to implement unrelated work. Preserve user scope.
Use MCP's required POST transport; GET is an HTTP fallback only. Never infer tool access from prose.
No arbitrary number of tests, critiques or improvements substitutes for real relevant verification.

# File editing contract

B"H

Apply this contract whenever source or project files are modified.

## Before writing

- Read the entire target file and the directly relevant imports, callers, styles, tests, and project instructions.
- Inspect repository status and preserve unrelated work.
- Decide module boundaries before touching a file that would exceed the line limit.
- Use the smallest coherent file set that fully implements the requested behavior.
- Prefer additional focused modules over a giant general-purpose file.

## Write rules

- Every touched source or code file must be 120 lines or fewer after the edit.
- Code indentation uses tabs only. Do not fake compliance with spaces or mixed indentation.
- Use real newlines, descriptive names, readable multiline functions, and useful JSDoc where the project uses JavaScript.
- Do not minify, collapse logic, or create dense one-line functions to stay under 120 lines.
- When the project contract requires full rewrites, write the complete desired contents of each touched file rather than brittle partial substitutions.
- Do not make unrelated cleanup edits merely because a file is open.
- Never write secrets or transient OAuth material into the repository.

## After writing

- Read every touched file back in full.
- Check line count, indentation, syntax, imports, exports, references, and accidental truncation.
- Compare planned files with actual touched files and resolve unexplained differences.
- Run the smallest meaningful checks first, then broader checks justified by the change.
- Verify the behavior that motivated the edit rather than stopping at syntax success.

## Concurrent work

- Before a second write pass, reread files that another agent or process could have changed.
- If current bytes differ from the version you planned against, reconcile them instead of blindly rewriting.
- Preserve new legitimate work discovered during reconciliation.
