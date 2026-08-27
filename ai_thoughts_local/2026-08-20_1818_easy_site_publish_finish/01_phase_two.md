B"H
Boruch Hashem
Blessed is He

# Phase Two — Architecture Critique

The Awtsmoos gives every authority its vessel; a shortcut must never impersonate a gate.
Awtsmoos.com becomes easy only when convenience and security share one truthful state.

## Twenty-five improvements
1. Preserve trusted OAuth user identity only from server context.
2. Never accept `actorUserId` from caller payload.
3. Normalize batch shape only in hosted compatibility code.
4. Support direct nested fields because AI tool schemas naturally emit them.
5. Preserve explicit `step.payload` precedence when supplied.
6. Preserve control fields such as `condition`, `then`, and `onError`.
7. Normalize nested branches recursively.
8. Test publication and ordinary filesystem steps in one batch.
9. Test explicit payload compatibility remains unchanged.
10. Test flat field forwarding with `path`, `siteId`, and `mode`.
11. Do not modify the generic 108-line batch engine unless necessary.
12. Do not weaken native tunnel authorization.
13. Distinguish account namespace ownership from legacy social aliases.
14. Prove canonical Drive/site keys accept the account namespace.
15. If account equality is authoritative, encapsulate it as a named predicate.
16. Keep legacy alias ownership as an allowed second path.
17. Test a foreign alias remains forbidden.
18. Test account-root ownership succeeds only when alias matches authenticated user.
19. Verify snapshot collector bounds and hidden-file policy remain intact.
20. Verify publish receipt returns server mapping, not guessed URL.
21. Verify status can read the same mapping after publish.
22. Verify public route serves the expected HTML title.
23. Verify CSS/JS assets return successfully.
24. Update `_agent/PUBLISHING.md` with the proven recipe.
25. Preserve final receipt in project metadata for future agents.

NEXT_ACTION: inspect account-scope and public-site routing code, then implement the smallest correct authorization reconciliation.
