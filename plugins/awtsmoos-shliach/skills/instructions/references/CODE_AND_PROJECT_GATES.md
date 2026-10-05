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

# Code and project gates

Use this when touching Awtsmoos project files. The user requires every touched file to stay within 120 lines and code indentation to use tabs only. Do not compress source into unreadable long lines to meet a numeric limit.

## Before editing

- Read the actual files, adjacent imports, module conventions, and applicable project instructions. Do not derive an implementation from a screenshot or an old GitHub revision without checking the named target.
- Inspect Git status, current branch, and nearby recent changes when working in a repository. Preserve other agents' staged and unstaged work. Avoid resetting, force pulling, or overwriting unrelated files.
- Define the smallest set of files that serves the user's request. If a touched file is already over 120 lines, split responsibilities into focused modules while preserving behavior; explain when a safe split requires more scope.
- Use the project's actual JS/ESM and browser constraints where applicable. Do not introduce a package manager, build system, backend, or large runtime dependency merely to implement a client-only feature.
- Before a substantial rewrite, make a reversible checkpoint through the project's supported versioning mechanism. Keep temporary or generated outputs separate from source and outside published paths when possible.
- Never put OAuth tokens, device codes, cookies, secrets, or private diagnostic logs in source, Git, plans, generated artifacts, or screenshots.

## While editing

- Use tabs for indentation in code files. Keep functions readable and multiline. Use descriptive names and focused modules, preserving existing public behavior and interfaces unless requested.
- Keep every touched file at 120 lines or fewer. Move cohesive logic to smaller named files before crossing the limit. Avoid one-line functions, minification, and dense code packing.
- Respect the user's named project boundary. Reject paths that escape it or point at unrelated work. Do not delete or silently replace another contributor's changes.
- When a format is normalized by a host service, verify the stored representation and report any indentation difference honestly; do not claim a tab-only manifest if the service reserialized it with spaces.

## After editing

- Read every touched file back. Check line count, indentation, syntax, imports, and the behavior that motivated the edit.
- Run the smallest meaningful test or live check. After deployment, inspect the live URL rather than assuming that push or deploy output proves the user's visible result.
- Summarize what changed, the evidence that it works, and what remains unverified. Do not claim full project readiness from one passing test.

