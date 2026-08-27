# B"H
# Boruch Hashem
# Blessed is He

# Unified Profile Hub

The Profile Hub combines existing public alias information with canonical social evidence without creating a second profile, comment, reference, or activity database.

## Response model

A profile response may include:

- public alias fields;
- public profile fields;
- active profile template;
- authored posts;
- canonical rich comments and replies;
- Heichel relationships and roles;
- inbound and outbound graph references;
- visibility-approved activity;
- owner-view state.

## Privacy boundary

The older return-history stream remains private and is omitted from non-owner responses.

Activity is filtered at read time:

- private events remain owner-only;
- selected-alias events require a verified viewer alias included in the event scope;
- Heichel-scoped events require a verified alias with a real relationship to that Heichel;
- public events may be read anonymously.

A public viewer alias string is never treated as authorization.

## Canonical comments

The alias-comment index stores compact pointers only. Comment bodies remain in the native rich-comment tree.

The profile route hydrates each pointer through the canonical comment store and exposes:

- whole-post targets;
- verse targets;
- subsection targets;
- parent comment IDs;
- parent-comment section IDs;
- voice transcripts;
- image, audio, and video manifests;
- canonical reference descriptors;
- comment sections.

## References

References are read from the native social graph around authored posts and rich comments. The response may include inbound and outbound:

- references;
- reposts;
- quotes;
- answers;
- cross-links.

The edge retains exact source and target identities rather than copying content into the profile.

## Compatibility

Profile comment routes prefer the packed alias-comment sidecar and transparently read the legacy `$i.db` Heichel and series maps when packed evidence is absent.

The legacy bulk rebuild route walks old comment trees and writes compact packed pointers while preserving its historical success response.

## Route

```text
GET /unified-social/profile-hub/:alias
```

An optional verified `aliasId` query parameter enables owner, selected-alias, and Heichel-member visibility decisions.

## Tests

The profile tests prove:

- route discovery;
- private return-history redaction;
- activity privacy metadata;
- canonical rich-comment behavior;
- reference graph metadata.

Existing comment-indexing route tests also remain required.

The Awtsmoos knows the complete person, every word, every reference, and every path at once. Awtsmoos.com reveals only the canonical and deliberately shared garments of that unity.