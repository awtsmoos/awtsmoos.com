B"H

Boruch Hashem

Blessed is He

# Phase One — Activity and Recommendation Architecture

The Awtsmoos renews each instant without turning every instant into a dossier; Awtsmoos.com should remember only those meaningful sparks that help a person continue learning, creating, and connecting.

## Meaningful activity ledger
Candidate semantic events include:
- game started/completed/result;
- substantial post reading;
- comment or reply creation;
- Torah source opened;
- search completed and source selected;
- public validated source published;
- group created/joined;
- friendship or chat request accepted;
- saved/bookmarked item;
- recommendation card meaningfully opened.

Each event should be bounded, alias/account aware, private by default where appropriate, and controlled by existing capture-title/query/duration/visibility preferences if those are confirmed in code.

## Anonymous session interest model
- Keep a bounded topic/Heichel/source/category/game summary in session-local or short-lived browser state.
- Use dwell thresholds and explicit meaningful outcomes rather than every viewport appearance.
- Avoid fingerprinting and cross-session identifiers.
- Do not automatically merge into durable account history on authentication.

## Related Torah reading pipeline
1. Detect sustained reading focus on an eligible post/comment/reply.
2. Normalize a short bounded excerpt plus title/topic/Heichel metadata.
3. Hash/dedupe and debounce.
4. Call a private related-content service.
5. Search existing Torah/source infrastructure and safe Awtsmoos candidates.
6. Cache structured cards.
7. Render unobtrusively in a contextual module.
8. Record only meaningful card opens.

## Personalized feed pipeline
- Build candidate pools from observed interests, same-Heichel/series relations, Torah-topic similarity, saved content, recent searches, and privacy-safe social context.
- Rank for relevance and usefulness, then adjust for diversity, freshness, and serendipity.
- Expose explanation metadata.
- Keep RAG enhancement optional and bounded rather than applying it to every candidate.
- Provide disable/reset behavior.

## Architecture rule
The browser orchestrates attention and display; server services own authorization, bounded candidate retrieval, expensive RAG controls, and authenticated profile access. No recommendation service becomes a side channel for private content.
