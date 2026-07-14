# B"H
# Boruch Hashem
# Blessed is He

# Awtsmoos Social Hub

The Social Hub is one responsive command center for public alias identity, canonical posts, exact comments and replies, media reports, references, private activity, profile evidence, and provenance-safe transformations.

## Entry point

```text
/social-hub/
```

Exact interaction deep links may include:

```text
/social-hub/?alias=<alias>&heichel=<heichel>&series=<series>&type=post&entity=<post>&verse=<verse>&subsection=<subsection>&reply=<comment>#interact
```

## Navigation

One semantic route model powers:

- the desktop command rail;
- the mobile safe-area dock;
- hash deep links;
- browser history;
- focus restoration;
- page titles;
- private navigation activity.

Routes:

- Pulse;
- Interact;
- Activity;
- Profile;
- References;
- Privacy.

Desktop and mobile are spatially different views of the same application state. No mobile-only data model or duplicated route system exists.

## Exact interactions

The interaction studio supports:

- whole-post comments;
- question and answer comments;
- verse comments;
- subsection comments;
- replies to comments;
- replies to sections inside comments;
- text;
- mood;
- voice transcript;
- image attachments;
- voice notes;
- video reports;
- canonical post, question, or answer references.

Media must finish native alias-owned upload before publication. Pending and failed local files block the publish action.

## Transformations

### Comment becomes post

An authored comment may become a new canonical post. The source comment remains unchanged. The new post receives:

- comment text;
- optional transcript;
- native media manifests;
- comment sections;
- original Heichel, post, verse, and subsection provenance;
- a graph edge back to the canonical source comment;
- an idempotency key preventing duplicate retries.

### Post becomes comment

A post may appear inside a comment as a canonical reference. The original post body is not copied into the comment record.

## Profile constellation

Profile responses combine:

- public alias and profile fields;
- authored posts;
- canonical rich comments and replies;
- Heichel roles;
- inbound and outbound graph references;
- visibility-approved activity.

The older private return-history stream is excluded from non-owner profile responses.

## Private activity

The Activity tab records Social Hub navigation and social actions through the selected verified alias.

It is private by default and supports:

- pause and resume;
- category-level capture;
- title capture;
- visible-duration capture;
- optional non-sensitive query capture;
- one-to-365-day retention;
- rapid-navigation deduplication;
- per-event sharing;
- selected-alias sharing;
- Heichel-member sharing;
- public sharing;
- event deletion;
- complete clearing;
- JSON export.

Sensitive query keys are removed before storage. Cross-origin paths are rejected.

The tracker is intentionally embedded in the Social Hub rather than secretly injected into every unrelated page. Other applications can adopt the same API explicitly after presenting the same privacy controls.

## Legal pages

```text
/legal/terms/
/legal/privacy/
```

Both pages are linked from the OAuth login-required page and the Social Hub privacy controls. They are versioned project policy statements and explicitly state that they are not legal advice.

## Visual system

The interface uses:

- a layered cosmic field;
- translucent spatial panels;
- animated provenance borders;
- an orbital social pulse;
- desktop multi-column workspaces;
- a mobile bottom dock respecting safe areas;
- view transitions;
- visible upload and mutation states;
- reduced-motion overrides;
- forced-colors support;
- high-contrast support;
- keyboard focus;
- coarse-pointer touch targets.

## Tests

```bash
npm test
npm run test:browser
npm run test:all
```

The real Chrome test uses a hermetic same-origin API fixture. It verifies desktop, 390-pixel mobile, and reduced-motion layouts while exercising comments, replies, image/audio/video upload, canonical references, activity sharing, privacy controls, profiles, comment promotion, and idempotent retry without touching live user data.

The Awtsmoos is one beneath every page, voice, image, comment, reference, and remembered step. The Social Hub makes that unity navigable without hiding the origin, privacy, or current state of any vessel.