B"H
Boruch Hashem
Blessed is He

# Social Content Model

The Social API is not a single CRUD table. It composes identity, governed spaces, structured content, relationships, discovery, communications, and storage.

## Core entities

User → aliases → Heichel spaces → content (posts/questions/answers) → series organization → comments/replies/reactions.

## Adjacent systems

Profiles, follows, feeds, graph/object APIs, search/RAG, drive, mail, notifications, media, moderation, jobs, migrations, unified-social adapters, live/presence, and civilization/universe models all live under the Social family.

## Canonical + compatibility

New `/content/...` routes coexist with extensive `/heichelos/...` compatibility paths. Do not delete duplicate-looking routes until the compatibility role is proven.

## Trust

Session/API-key identity is established first; each resource operation can impose ownership/editor/member/moderation checks.

Use [Social API tutorial](../API/SOCIAL.md) plus the generated route tutorial index.
