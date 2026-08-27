# B"H
# Boruch Hashem
# Blessed is He

# Unified Social Backend

This domain coordinates native Geelooy identity, Heichel, series, content, graph, notification, draft, asset, and governance helpers. It does not introduce a second social database.

## Identity

`identity/` returns public alias context, creates aliases through native helpers, and selects the protected default alias. No route returns or stores passwords, cookies, tokens, authorization headers, or private session material.

## Acting-alias authorization

`permissions/ActorAuthorization.js` adapts the native `verifyAliasOwnership` helper and fails closed when its signature or result is ambiguous.

Every acting-alias route requires:

1. a live authenticated user;
2. ownership of the claimed alias;
3. compiled capabilities;
4. destination policy;
5. legal workflow or hierarchy state.

A public alias ID alone never grants authority.

## Permissions

The compiler dual-reads:

- Heichel owner information;
- current member records;
- legacy editors;
- legacy moderators;
- legacy contributors;
- legacy followers.

It emits one effective role, every evidence source, named capabilities, and direct, submit, or deny explanations.

## Destinations

`destinations/` provides searchable Heichel evidence, bounded nested-series traversal, breadcrumbs, root-series semantics, effective access, and inline Heichel or series creation through native helpers.

## Publishing

`publishing/` enforces one canonical origin and deterministic secondary placements. It supports references, reposts, quotes, excerpts, and syndication. Idempotency prevents retry duplication. Native content helpers create posts, questions, and answers; native graph helpers receive provenance edges.

## Review

`review/` stores typed submissions, legal transitions, reviewer assignment, history, scheduling, publication, and notifications. Approval does not bypass final capability and ownership checks.

## Governance

`permissions/RoleMutationService.js` and invitation services provide:

- hierarchy-safe roles;
- protected ownership;
- dual writes to current and legacy role stores;
- governance audit records;
- native notifications;
- seven-day invitations;
- explicit recipient consent;
- authority revalidation at acceptance;
- expiration evidence.

## Compatibility

Old routes and records remain readable. New modules delegate to existing helpers and coexist through dual-read or dual-write evidence until migration parity is proven.

## Testing

The test folder uses an in-memory database to prove schemas, access, destinations, planning, idempotency, publication, review, native ownership adaptation, governance hierarchy, invitation consent, and route discovery. Existing rich-social and route-coverage tests are also required.

The Awtsmoos is one before all stores, routes, roles, and graphs. These modules reveal that unity without erasing the older vessels through which Awtsmoos.com already lives.