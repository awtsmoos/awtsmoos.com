# B"H

Boruch Hashem

Blessed is He

## Route and Style Revelation Plan

The Awtsmoos gives each page a name and each stylesheet a boundary. The audit must reveal those boundaries instead of adding one more global generation.

## Route families

- Home and global shell.
- Search and living library.
- Heichel discovery, detail, governance, review, and submissions.
- Series, post reader, questions, answers, comments, replies, verse and subsection discussions.
- Composer, post editor, Heichel editor, uploads, media, voice, and video.
- Social feed, Social Hub, activity, references, reactions, and moderation.
- Profiles, aliases, identity creation, notifications, mail, and settings.
- Authentication, signup, legal, about, errors, offline, and utility surfaces.
- Additional routes discovered from real HTML and server route declarations.

## Ownership graph

For every HTML entry point, record:

1. Direct stylesheet links.
2. Transitive `@import` files.
3. JavaScript-created `<style>` nodes and injected links.
4. Document foreground and background owner.
5. Navigation and page-frame owner.
6. Cards, controls, feedback, motion, and responsive owners.
7. Broken paths, cycles, duplicate selectors, and historical generations still imported.

## Conflict questions

- Does more than one generation own the same route shell?
- Does a global selector leak into route-specific UI?
- Does every visible surface own foreground and background?
- Do mobile rules replace desktop assumptions rather than merely squeeze them?
- Do API states distinguish loading, empty, authentication, permission, network, server, stale, and offline conditions?
- Does the service worker invalidate changed shells and styles?

## Source-write gate

No production file is rewritten until a route failure is reproduced in source or browser evidence. Every approved rewrite receives a precise file list and verification receipt.
