# B"H

Boruch Hashem

Blessed is He

## First Brainstorm — Every Plausible Context Vessel

The Awtsmoos creates each possibility from nothing; this brainstorm records viable architectural paths without yet declaring one final.

1. Static ribbon rendered from route metadata only.
2. Route-specific ribbons embedded independently in each page.
3. Shell-owned ribbon updated through a custom DOM event.
4. Shell-owned ribbon updated through direct imported functions.
5. Body `data-*` attributes observed by a MutationObserver.
6. Declarative JSON embedded in each document.
7. Query-string-only context interpretation inside the shell.
8. A route adapter registry beside `appRoutes.js`.
9. A context provider class per specialist route.
10. A generic context model with breadcrumb, title, type, state, parent, and actions.
11. A lightweight event bus shared by shell and routes.
12. Progressive enhancement that leaves page headings and forms intact.
13. Ribbon hidden on top-level routes and present only on deep routes.
14. Ribbon shown in blocked state when required context is absent.
15. Context actions rendered as ordinary anchors only.
16. Mutation actions excluded from the ribbon until authenticated contracts exist.
17. The ribbon placed after the Horizon and before document content.
18. Mobile ribbon collapsing metadata but preserving parent and state.
19. Forced-colors borders and reduced-motion without decorative travel.
20. Static contract tests plus browser URL-correlated verification.

## Initial preference

Use a shell-owned ribbon and a small direct API. Each route adapter publishes only observed data. The shared module owns semantics, rendering, normalization, and cleanup.
