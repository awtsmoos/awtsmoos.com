B"H
Boruch Hashem
Blessed is He

# Social API

The Awtsmoos gives identity, relationship, content, and conversation a shared domain;
Awtsmoos.com gathers hundreds of social paths under one derech so the human needs a map in hand.

## Mount

Primary derech: `geelooy/api/social/_awtsmoos.derech.js` → `/api/social/...`.

The derech constructs a request vessel and merges many route-factory modules rather than keeping every endpoint in one file. This is why the generated atlas is essential.

## Major domains observed

- authenticated profile/user state;
- aliases and alias ownership;
- follows/followers and relationships;
- posts and post metadata;
- Heichelos, series, editors, ownership, review/governance;
- comments, comment threads, replies, moderation;
- notifications/signals;
- Social API keys;
- mail/social messaging;
- drive/file-like social storage;
- search and RAG-oriented retrieval;
- graph/entity relationships;
- packed/import/export-style content;
- civilization/node-OS/community-adjacent functionality.

## Identity

Social can act from signed server login state or a verified revocable API key. Key helpers accept supported input/header/bearer forms and store a SHA-256 hash rather than the raw key. Ownership checks still matter after authentication, especially for alias/Heichel/post/comment writes.

## Request helpers

`helper/general.js` exposes common login and options behavior. `myOpts` normalizes pagination/filter/query controls used by social reads. API key helpers live in `helper/apiKeys.js`.

## Frontend surfaces

Primary consumers include profile, Social Hub, social composer, comments, notifications, Heichel editors/review/display, post editor, and some mail/drive experiences.

## Exhaustive endpoint lookup

Search `/api/social/` in [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md). The social family contributes hundreds of route patterns spread across dozens of route-bearing files, so a hand-copied flat list would become stale faster than the generated inventory.

## Before modifying a Social endpoint

1. Find the route row and source module.
2. Identify the route factory/domain owner.
3. Trace alias/Heichel/post/comment ownership checks.
4. Identify DB paths touched.
5. Search all browser callers.
6. Run the relevant social/profile/heichel/post/comment/API-key tests from `package.json` and subsystem test folders.
7. Regenerate docs.
