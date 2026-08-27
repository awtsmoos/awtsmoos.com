# B"H
# Boruch Hashem
# Blessed is He

# Unified Activity Ledger

This domain provides user-controlled page and social activity memory for verified public aliases.

## Privacy law

- Private by default.
- A public alias identifier is not authentication.
- Owner reads and mutations require native ownership verification.
- Selected-alias and Heichel-member views verify the viewer alias before disclosure.
- Anonymous viewers receive only explicitly public events.
- Cross-origin paths are rejected.
- Sensitive query keys are removed before storage.
- Query, title, and duration capture preferences alter the stored event itself.

## Controls

- Pause or resume.
- Capture categories independently.
- Retention from one to 365 days.
- Private, selected-alias, Heichel-member, or public event scope.
- Per-event visibility updates.
- Individual forgetting.
- Complete clearing.
- JSON export.
- Rapid same-path navigation deduplication.

## Storage

Event bodies and the bounded chronological index live under the alias-owned social activity path. Deletion removes the event from active indexes and leaves only a redacted tombstone.

## Adoption

The Social Hub has a full tracker with route and dwell-time awareness. The Social Composer and Heichel Review Center explicitly adopt the shared `ActivityBeacon`.

The beacon is not secretly injected into every unrelated legacy page. Additional applications can adopt it after presenting the same legal and privacy controls.

## Tests

The test folder proves sanitization, storage, deduplication, pause behavior, capture preferences, visibility ACLs, deletion, and clearing with an in-memory database.

The Awtsmoos remembers every instant without a ledger. Awtsmoos.com therefore treats its finite activity memory as a reversible user-owned vessel rather than an invisible surveillance source.