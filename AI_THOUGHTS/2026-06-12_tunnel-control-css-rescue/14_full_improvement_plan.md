B"H

# Full Improvement Plan: Tunnel Control Stability Pass

Scope:

Improve the Tunnel Control app code from actual inspection, not guessing. Stay inside `geelooy/apps/tunnel-control`. Do not partially patch files. Rewrite complete files only if a real issue is proven.

Phases:

1. Static JS syntax audit
   - Run `node --check` on every JS module under `js/`.
   - Record failures exactly.
   - If any module fails, read the whole file and rewrite the whole file.

2. CSS structural audit
   - Check brace balance on every CSS module under `css/future`.
   - Search for risky layout selectors specifically affecting shell/dashboard/workspace.
   - Do not change cosmetic rules without a concrete issue.

3. Import/export audit
   - Use Node static regex to confirm every relative JS import resolves to an actual file.
   - If a missing import exists, read dependency path and fix the complete affected file.

4. Runtime-unsafe DOM audit
   - Search for unsafe raw HTML insertion, direct innerHTML, unguarded querySelector assumptions, and missing null checks in boot/dashboard code.
   - Only rewrite if it can cause visible broken UI.

5. Final verification
   - Re-run syntax checks.
   - Re-run import resolver.
   - Re-run CSS brace scan.
   - Write final report with exact changed files and exact tests.

Initial candidate files if problems appear:

- `js/boot/*.js`
- `js/dashboard/*.js`
- `js/ui/core/html.js`
- `css/future/views/*.css`
- `css/future/core/*.css`

No code changes happen until the audits reveal specific failures.
