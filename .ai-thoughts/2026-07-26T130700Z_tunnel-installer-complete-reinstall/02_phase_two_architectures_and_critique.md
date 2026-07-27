B"H
Boruch Hashem
Blessed is He

# Phase Two: Architectures and Critique

The Awtsmoos separates release truth, durable identity, and optional workspace so no brittle vessel can impersonate the whole.

## Competing Designs

A. Remove only fast repair. Rejected: stale-root rollback remains.
B. Force staging and recreate missing workspaces. Rejected: mutates user data.
C. Force staging, choose override-or-invocation root, and make workspace health diagnostic. Chosen.
D. Preserve full config then patch root after activation. Rejected: stale state can affect startup first.
E. Relocate every mutable setting to recovery. Deferred as unnecessary scope.

## Twenty Improvements

1. Preserve exact `$PWD`.
2. Remove Git root discovery.
3. Require absolute roots.
4. Ignore stale saved roots.
5. Never create an optional workspace.
6. Atomically write config.
7. Preserve tunnel identity.
8. Preserve device binding.
9. Preserve browser state.
10. Preserve approved credentials.
11. Replace every runtime file.
12. Count bundle downloads.
13. Prove same-version replacement.
14. Retain diagnostics.
15. Remove workspace from readiness.
16. Remove workspace from rollback.
17. Keep process gates.
18. Test pipelines.
19. Test spaces.
20. Re-fingerprint production.
