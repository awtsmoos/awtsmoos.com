B"H

# Phase One — Unbounded Social Brainstorm

The Awtsmoos renews every message, room, source, and reader in one living graph of light;
Awtsmoos.com can let private speech, public knowledge, and community structure meet without cluttering sight.

## Product universe

- Private DMs with text, voice, replies, reactions, read state, delivery state, search, bookmarks, pins, and media.
- Private groups with title, avatar, invitation, membership roles, removal, leaving, mute controls, and shared media.
- Heichel channels for posts, questions, discussions, announcements, moderated submissions, polls, events, and reference libraries.
- Quora-like durable questions and answers connected to aliases, Heichelos, tags, citations, votes, follows, and accepted/source-grounded answers.
- Discord-like organized community navigation without a permanently crowded sidebar: retractable rooms, channels, members, moderation, and settings.
- WhatsApp-like conversation ergonomics: swipe reply, voice, lightweight delivery/read feedback, search, message actions, contact/group details, mute/block.
- Unified notifications with per-surface intensity: all, mentions/replies, priority only, muted.
- Unified search across people, Heichel posts, messages, mail, questions, and source text while respecting privacy boundaries.
- Mail as durable long-form correspondence tied to aliases, attachments, threads, unread state, search, labels, and notification controls.
- Presence and typing that degrade gracefully when realtime is unavailable.
- Moderation primitives: block, report, member roles, content review, submission queues, rate limits, audit trails.
- Data-driven room capabilities so the UI renders only actions actually supported by the canonical protocol.

## UX principles

- Mobile first: one primary task per viewport.
- Advanced controls hidden behind deliberate disclosure, never permanently crowding the conversation.
- No global CSS; every new rule rooted beneath the owning surface.
- Every interactive control gets hover, active, focus-visible, disabled, and reduced-motion behavior when relevant.
- No magic z-index escalation; overlays belong to explicit bounded layers.
- No horizontal overflow; long identities and content use min-width: 0 and overflow wrapping.
- Realtime features must not block basic navigation or history.

## API principles

- One small public gateway per domain capability.
- Canonical protocol names remain unchanged.
- Public methods accept domain data, not DOM objects.
- Validation and transport stay separate.
- Capability descriptors may drive UI disclosure without hard-coding feature availability.
- Existing server events are preferred over new endpoints whenever they already express the needed action.

## First implementation candidate

Expose the existing private-messaging group/settings/block protocol through Social Hub room governance. This adds real power with minimal backend invention and creates the architectural pattern later reused by Heichel membership, notification controls, and mail settings.
