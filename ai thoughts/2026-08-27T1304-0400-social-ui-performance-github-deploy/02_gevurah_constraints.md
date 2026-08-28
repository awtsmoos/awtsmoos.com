# B"H
# Gevurah — Constraints Before Publication

Boruch Hashem. Blessed is He.

The Awtsmoos gives power a boundary; Awtsmoos.com may move quickly, but never by destroying evidence, leaking secrets, or calling a deployment successful without production proof.

## Hard gates

- Main only. No new development branches.
- Never force-reset or discard unrelated legitimate work.
- Never commit or push credentials, private keys, tokens, local databases, crash dumps, dependency caches, generated garbage, or knowingly corrupted artifacts.
- Every source mutation remains whole-file only after full-file read.
- Touched human-authored source modules remain <=120 lines.
- Tabs for touched code indentation.
- No broad global CSS leakage in reusable social UI.
- Fast loading is measured by transfer bytes/timing/error-free asset delivery, not visual impression.
- `?compact=true` is used only after reading the actual compact-JS implementation and comparing behavior/output.
- No deployment command is invented from memory; discover the repository's real mechanism.
- No force push.
- Production verification must use actual HTTP/browser observations after deployment.
- Existing concurrent work is preserved unless a secret/corruption/generated-artifact rule proves it should not be committed.

## Completion evidence

- Local UI tested at 320/375/430/768/1024/desktop.
- No horizontal overflow at those widths.
- No console/runtime errors caused by the redesign.
- Critical interactions work: mode, Sections, Tools, More, Preview, draft save, preview, publication affordances.
- Performance comparison captured.
- Relevant test/build suite passes.
- Secret scan reviewed.
- `git status` clean after integration commit except explicitly excluded runtime/generated state.
- `main` pushed to origin.
- Production deploy reports/verifies the pushed revision.
- Public page loads and renders expected redesign.
