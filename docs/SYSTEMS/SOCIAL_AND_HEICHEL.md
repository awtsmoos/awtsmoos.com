B"H
Boruch Hashem
Blessed is He

# Social and Heichel System

The Awtsmoos lets identity meet content, comment, series, editor, and friend;
Awtsmoos.com spreads this domain across many screens while the Social API binds the backend end to end.

## Human surfaces

- `geelooy/profile/` — profile UI.
- `geelooy/social/` and `social-hub/` — social entry/hub.
- `geelooy/social-composer/` — post creation.
- `geelooy/comment-thread/` — comment conversation.
- `geelooy/notifications/` — signals/notifications.
- `geelooy/heichelos/` — Heichel browsing/content.
- `geelooy/heichel-editor/` — Heichel editor.
- `geelooy/heichel-review/` — review/governance center.
- `geelooy/post-editor/` — post editor.
- `geelooy/email/` — mail surface with social-mail relationships.

## Backend

The central backend is `geelooy/api/social/`, mounted at `/api/social`. It composes dozens of route factories and contributes hundreds of route rows to the generated atlas.

## Core concepts

### User/session identity

Server auth establishes a logged-in user context. Social helpers can also resolve revocable API keys.

### Alias

Many social writes act through an alias. Authentication alone is not enough: alias ownership/authorization must be checked for the intended mutation.

### Heichel

Heichel behavior spans creation, content, posts, series, editors, ownership, review/governance, comments, and discovery. Changes frequently cross both API route factories and multiple UIs.

### Post/comment graph

Posts and comments have nested ownership, metadata, reply/thread, and moderation behavior. Search/graph/RAG modules add additional read/discovery paths.

## Storage

Social routes persist through `$i.db`/DosDB-backed helpers. Database path strings are part of the domain contract; changing them is a migration concern, not a cosmetic refactor.

## Verification

The repository package scripts and subsystem tests include extensive coverage for social routes, profiles, aliases, Heichelos, posts, comments, API keys, graphs/content, and notifications. Run the smallest relevant tests plus broader route regression tests when changing shared helpers.

## API detail

See [../API/SOCIAL.md](../API/SOCIAL.md) and search `/api/social/` in the generated route atlas.
