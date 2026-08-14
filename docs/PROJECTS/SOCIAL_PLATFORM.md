B"H
Boruch Hashem
Blessed is He

# Social and Heichel Platform

The Awtsmoos lets identity become relationship, content, discussion, governance, discovery and notification while Awtsmoos.com spreads that one domain across APIs and many focused public interfaces.

## Core source families

- `geelooy/api/social/` — backend domain and route composition.
- `geelooy/social-hub/` and related Social public pages.
- `geelooy/profile/`, `comment-thread/`, `post-editor/`, `heichel-editor/`, `heichel-review/`, `notifications/` and composer surfaces.
- DosDB/Social packed storage for persisted content and comments.
- realtime Social presence/typing/event compatibility.

## Domain concepts

Aliases, profiles, follows, posts, Heichelos, series, editors/governance, comments, submissions/review, notifications/signals, drive/search/graph/mail and discovery live in one broad domain but have separate authorization rules and UI surfaces.

## Trust boundary

Signed sessions and verified Social API keys establish authenticated identity; alias/Heichel/resource rules still decide authorization. Client-provided alias or owner fields do not replace trusted server identity.

## Generated evidence

Use `API_ROUTE_CONTRACT_ATLAS.md`, `API_CALLER_INDEX.md`, `PROJECT_DEPENDENCIES.md`, `PUBLIC_ENTRY_POINTS.md`, `TEST_OWNERSHIP.md` and `ENVIRONMENT_VARIABLES.md` to locate exhaustive source relationships.

## Human manuals

- `docs/API/SOCIAL.md`
- `docs/SYSTEMS/SOCIAL_AND_HEICHEL.md`
- `docs/API/AUTHENTICATION.md`
- `docs/DATA/README.md`
- `docs/SECURITY/TRUST_BOUNDARIES.md`

## Change strategy

Trace API route, caller, alias/Heichel authorization, persistent path family, notification/search side effects and realtime events. Shared Social helper changes deserve broader route/content/governance/comment/notification tests than a single UI page change.
