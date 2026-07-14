# B"H
# Boruch Hashem
# Blessed is He

# Geelooy Unified Social Composer

The composer is a dependency-free browser application for authenticated alias identity, one canonical content origin, rich structured content, media manifests, nested Heichel destinations, secondary references, and moderation-aware publication.

## Entry points

```text
/social-composer/
/social-composer/?alias=<alias>&heichel=<heichel>&series=<series>
/social-composer/?alias=<alias>&heichel=<heichel>&question=<question-id>
/social-composer/?source=<post-id>&sourceHeichel=<heichel>&sourceSeries=<series>
```

The `source` form preserves the existing post as canonical. Any newly selected destination becomes a reference placement rather than copied content.

## Identity

- Reads aliases from the authenticated Awtsmoos session.
- Creates a first or additional public alias inline.
- Selects a default alias through the native protected session route.
- Stores only public alias ID, name, default preference, and verification time.
- Never stores cookies, tokens, passwords, authorization headers, or private user IDs.
- Revalidates ownership server-side before every institutional write.

## Destinations

The destination panel supports:

- owned, joined, contributed, followed, and invited Heichelos;
- Heichel Home, backed by the native `root` series;
- nested series trees and breadcrumbs;
- descriptions, stable IDs, counts, roles, and policy explanations;
- inline Heichel creation;
- inline nested-series creation;
- one canonical destination;
- reference, repost, quote, excerpt, and syndication placements.

## Content

- regular posts;
- first-class questions and answers;
- article, image, short, video, audio, story, poll, live, and quote presentation;
- safe rich blocks and inline marks;
- image, GIF, audio, video, and document attachments;
- whole-post comments;
- verse and subsection discussion coordinates;
- local and native server drafts;
- publication-plan preview;
- idempotent final execution.

## Publication law

A content entity has exactly one canonical origin. Repeated placement in another Heichel or series creates a graph placement and provenance record. A destination may accept the placement directly, require moderator review, or deny it according to compiled capabilities and policy.

## Diagnostics

Real-browser diagnostics are exposed intentionally:

```js
window.RichSocialComposer.state.snapshot()
window.RichSocialComposer.payload()
window.RichSocialComposer.publicationPlan()
```

## Tests

```bash
npm test
npm run test:browser
npm run test:all
```

The real Chrome journey uses a same-origin hermetic API fixture and never touches live user data. It verifies aliases, Heichel and series creation, references, media, questions, answers, drafts, planning, publication, moderation, roles, invitations, and series policy.

The Awtsmoos is one before every post, destination, image, answer, and review. This application preserves that unity as canonical origin, then lets the light appear in many honest vessels on Awtsmoos.com without copying away its source.