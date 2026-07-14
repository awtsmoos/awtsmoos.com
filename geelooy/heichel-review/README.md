# B"H
# Boruch Hashem
# Blessed is He

# Heichel Review and Governance Center

This application combines private submission review with verified institutional governance for one Heichel.

## Entry point

```text
/heichel-review/?heichel=<heichel-id>&alias=<acting-alias>
/heichel-review/?heichel=<heichel-id>&alias=<acting-alias>&submission=<submission-id>
```

The acting alias is public identity context only. Every private read and write revalidates ownership through the authenticated Awtsmoos user session before capabilities are compiled.

## Review center

The queue supports:

- state, series, and submitter filters;
- new canonical posts;
- questions and answers;
- reference and repost placements;
- quotes and excerpts;
- edit and series proposals;
- stable deep links;
- source provenance and structured payload inspection;
- assignment and chronological history;
- triage, changes requested, approval, scheduling, publication, rejection, withdrawal, and resubmission.

Illegal state transitions are rejected by the backend. Every accepted transition records actor, previous state, next state, note, and time.

## Member governance

The governance panel shows compiled evidence from both current member records and legacy role indexes.

Assignable roles:

- admin;
- moderator;
- editor;
- contributor;
- member;
- follower;
- guest, which removes ordinary membership.

Owner transfer is intentionally excluded. An acting role may grant only a lower role and must possess `manageMembers`.

Role mutations rewrite both governance generations, append a governance audit record, and notify the affected alias through native notifications when possible.

## Invitations

- Seven-day expiration.
- No authority before acceptance.
- Indexed from both Heichel and invited alias.
- Accept or reject under the invited alias's verified session.
- Acceptance revalidates that the original inviter still possesses `manageMembers` and may still grant the role.
- Expiration, acceptance, rejection, and resulting role grant are audited separately.

## Series policy

Owners and administrators may write a bounded series policy for:

- content submissions;
- content approval;
- reference submissions;
- reference approval;
- comments;
- formal answers.

A child series cannot weaken restrictions imposed by the parent Heichel policy.

## Security

The UI never treats an alias ID as authority. Server routes require:

1. a live Awtsmoos user session;
2. native ownership verification for the acting alias;
3. compiled Heichel and series capabilities;
4. legal state transition or hierarchy rules.

## Tests

The shared real-Chrome journey exercises moderation and governance through visible controls against a hermetic same-origin API fixture. Static tests cover review actions, governance transport, role options, and bounded policy values.

The Awtsmoos holds judgment, mercy, membership, and consent in one indivisible present. Awtsmoos.com reveals that unity through evidence, explicit boundaries, and an audit trail that no hidden moderator can silently rewrite.