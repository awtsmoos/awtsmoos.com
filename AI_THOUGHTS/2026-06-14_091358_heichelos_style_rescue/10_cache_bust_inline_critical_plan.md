B'H
# Cache Bust + Inline Critical Post Reader Plan

Fresh conclusion: relying only on `/heichelos/post/styles/main.css?v=legend-001` is not enough. The user sees raw controls live. The safest next repair is to make the post templates self-protecting:

1. Bump CSS/JS asset query strings from `legend-001` to `legend-002`.
2. Add a direct `live-template.css?v=legend-002` link instead of relying only on nested imports.
3. Add a tiny inline critical style in both post templates so `hidden-details` is hidden and floating controls are fixed even if external CSS cache fails.
4. Update version contract tests if needed.
5. Run template contract, post style ownership, CSS quality, and route/style static checks.

This is not a partial CSS fantasy; it attacks the actual symptom: raw controls visible before stylesheet coverage arrives.
