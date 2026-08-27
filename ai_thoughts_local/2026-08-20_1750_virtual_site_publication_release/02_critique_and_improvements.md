B"H
Boruch Hashem
Blessed is He

# Phase Three — Critique and Thirty Improvements

The Awtsmoos renews the critique; every certainty must survive the test of the actual wire.
Awtsmoos.com becomes trustworthy when docs, code, deployment, and runtime all answer to the same fire.

1. Verify git root and branch before edits.
2. Inspect working tree to avoid overwriting unrelated user work.
3. Read every candidate file fully.
4. Trace imports and exports.
5. Trace public action allowlists.
6. Trace generated action schemas separately from runtime registries.
7. Trace OAuth identity construction.
8. Trace required scopes.
9. Trace alias ownership checks.
10. Trace siteId validation.
11. Trace folder path normalization.
12. Trace hidden-file policy.
13. Trace manifest byte/file caps.
14. Trace Drive project write semantics.
15. Trace site mapping persistence.
16. Trace canonical route builder.
17. Trace site serving route.
18. Trace cache invalidation after publish.
19. Trace publication status liveness semantics.
20. Trace tests for unauthorized callers.
21. Trace tests for snapshot publication.
22. Trace tests for public route response.
23. Trace deployment scripts and current process manager.
24. Confirm whether production is Git-driven or server-restart driven.
25. Avoid using local browser credentials as a publication bypass.
26. Prefer server-side hosted identity propagation.
27. Ensure action docs are discoverable from Virtual OS root.
28. Ensure wrapper schemas expose publication actions directly or via a generic safe action carrier.
29. Verify deployed registry after release before publishing the game.
30. Verify the final game URL independently and preserve the receipt.

## Final provisional design
Do not invent a second publication subsystem. Finish the existing hosted publication bridge, expose it through every relevant action manifest/schema, test its trusted identity boundary, deploy through the repository's real release path, then use the Virtual OS action itself as the end-to-end acceptance test.

NEXT_ACTION: inspect repository state and current publication/deployment files, then write the exact final file plan.
