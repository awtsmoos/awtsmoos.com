B"H

# Critique Pass — 24 Improvements Before Native Implementation

This is an implementation design ledger, not hidden reasoning.

1. Project identity must never be a filesystem path; paths are backend details.
2. Native tunnel and Virtual OS must implement the same project-facing contract.
3. Virtual OS Preview cannot remain diagnostic-only; preview issuance belongs in a server service.
4. Preview URLs must be server-issued and generation/revision-bound.
5. Canonical/live URLs must remain separate from preview URLs.
6. A public-looking URL candidate must remain untrusted until HTTP/runtime verification succeeds.
7. GitHub must be an optional provider adapter rather than project authority.
8. First-party Awtsmoos Repository needs history/diff/branch APIs before Smart HTTP/SSH compatibility.
9. Commit and push must be separate capabilities and separate receipts.
10. Force-push should be forbidden in the first agent-safe tier.
11. Push must pin expected remote head and fail on divergence.
12. Provider secrets must never enter browser JavaScript, project metadata, handoff files, or agent prompts.
13. GitHub OAuth/GitHub App should be preferred over manual token/key workflows.
14. PAT/SSH fallback credentials require server-side encrypted connection records and safe metadata views.
15. DNS provider writes require zone-scoped provider connections and explicit dnsWrite capability.
16. DNS changes must be plan → apply → verify → rollback, not blind imperative calls.
17. Desired DNS record sets must reject CNAME alongside A/AAAA for the same owner name.
18. Existing custom-domain claim verification remains separate from provider DNS mutation authority.
19. Repository/provider connection capability must be visible before an agent proposes a mutation.
20. Cross-session handoff descriptors must never be bearer tokens.
21. Handoff must require fresh OAuth and mint an expiring project capability after authorization.
22. Default handoff capability should allow read/edit/preview, while publish/DNS apply/commit/push require explicit elevation.
23. Every deploy should record project + revision + actor + time so rollback and history converge.
24. Project creation must return a machine-readable bootstrap receipt rather than a prose-only path.

## New architecture consequence

The platform should expose one stable project object whose source, repository, deployment, domain, provider connections, and handoffs are separate witnesses. An Awtsmoos Shliach should operate typed project verbs, while filesystem, Git, DNS-provider, and deployment adapters remain implementation details.
