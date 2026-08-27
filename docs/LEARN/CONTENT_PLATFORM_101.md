B"H
Boruch Hashem
Blessed is He

# Content Platform 101

## What you will learn

How Social identity, Heichel spaces, posts/questions/answers, series, comments, governance, search, mail, notifications, and drive fit together.

## Core hierarchy

A **user** can own aliases. An **alias** is the Social-facing identity. A **Heichel** is a governed content/community space. Heichel content includes posts/questions/answers and can be organized through series. Comments/replies attach to content and subsection/verse surfaces. Governance decides who can edit, submit, moderate, approve, or publish.

## Canonical and compatibility layers

The Social API contains both newer `/content/...` paths and many compatibility routes under `/heichelos/...`. Series/post code intentionally preserves old path shapes while richer entity/content models evolve beside them.

## Trust

Server session/API-key identity is established first. Resource authorization—owner/editor/member/moderation roles—is checked separately by content handlers.

## Beyond CRUD

Social also contains profiles, follows, feeds, search/RAG, graph/object APIs, drive, mail, notifications, media, moderation, migrations, unified-social adapters, and live/realtime features.

## Next

Start [Social Content Model](../TUTORIALS/CONTENT/SOCIAL_CONTENT_MODEL.md), then Heichel/posts/series/comments/governance tutorials.
