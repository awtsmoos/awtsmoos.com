B"H

Boruch Hashem

Blessed is He

# Phase One — API Evolution Boundaries

The Awtsmoos speaks creation into ordered forms; Awtsmoos.com APIs should likewise make intent explicit, preserve old vessels where callers depend on them, and reveal errors without leaking what is hidden.

## Compatibility rules
- Discover current protocol names and version fields before designing replacements.
- Prefer additive fields and versioned capabilities over breaking existing event names.
- Keep legacy callers functional whenever modern pagination or richer metadata is introduced.
- Separate application protocols while multiplexing them through the existing physical transport.

## Response shape goals
Where compatible with observed code, converge toward:
- stable application/version/type fields;
- structured `payload` data;
- cursor/page metadata for bounded collections;
- stable error codes;
- explicit retryable versus non-retryable classification;
- bounded response sizes.

## Validation and authorization
- Validate type, size, enum, cursor, alias, context, and pagination inputs server-side.
- Resolve account and alias authority before data lookup that could disclose private existence.
- Authorize private search and group actions on the server.
- Validate public source session/selection ownership before publication.

## Expensive service APIs
Related-content and personalized-feed requests should, if implemented, expose clear service boundaries with:
- bounded semantic context;
- dedupe keys;
- cache policy;
- rate limits;
- timeout/fallback behavior;
- authenticated versus anonymous mode;
- structured recommendation cards and explanation metadata.

## Search
Unified communication search must federate authorized sources without creating a public index of private bodies. Mail should remain a reference/deep-link authority unless the existing Mail backend explicitly supports safe search integration.

## Evidence gate
No endpoint/event shape will be changed until its server handler, browser caller, persistence dependency, and direct tests have been inspected together.
