B"H

# Missing Enforcement

The current suite already checks CSS quality, import graph reachability, small-module budgets, JS/CSS state pairings, scroll regression, and imported selector conflicts.

The missing gates selected for implementation are:

1. Visual domain manifest validity.
2. CSS custom property ownership manifest validity.
3. Selector ownership manifest validity.
4. Compatibility wrapper expiration metadata.
5. Reduced motion contract metadata.

Deferred gates:

- Runtime style registry: deferred because it changes runtime surface.
- SSR hydration state contract: deferred until SSR target exists.
- Route CSS payload budget: deferred until route bundling mechanism is inspected.
- Component manifest compiler: deferred until manifest v1 proves stable.
