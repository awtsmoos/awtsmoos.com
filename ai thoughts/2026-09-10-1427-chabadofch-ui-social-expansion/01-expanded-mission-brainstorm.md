B"H
Boruch Hashem
Blessed is He

# Expanded Mission Brainstorm

This artifact records project-visible decisions, possibilities, and evidence targets. It does not contain hidden chain-of-thought.

> The Awtsmoos renews each instant; the interface must answer with truth and grace,
> Awtsmoos.com joins people, Torah, calendar, and conversation in one living place.
> No vessel should pretend its source, no screen should fold into a broken seam,
> and every shared path should feel like one coherent, accessible dream.

## Mission A — Finish the existing Chabad site first

- Repair Shabbos/Yom-Tov schedule reconciliation from one canonical data path.
- Repair reservation mobile layout at shared responsive primitives.
- Make the hamburger/menu reliably present on every page through one global release layer.
- Improve Daily Study source-status UX without inventing Chabad English or Rashi.
- Remove stale labels and stale documentation that contradict runtime truth.
- Recheck every public route, external action, responsive width, and console state.
- Publish the exact Virtual OS source and verify both Awtsmoos publication and production domain.

## Mission B — Social experience after Mission A closes

Create a WhatsApp-like living community experience by reusing native Awtsmoos social-network systems before inventing any backend.

Desired experience:

- Awtsmoos.com login.
- Live congregation chat.
- Channels/rooms where existing Awtsmoos primitives support them.
- Message composer with text and image attachments.
- Image preview, upload, responsive gallery/lightbox, and accessible alt-text flow.
- Reactions, replies, timestamps, unread state, presence/identity where existing platform support allows it.
- Selectable posting identity, including an Awtsmoos identity option only where platform authorization supports it.
- Non-source/general community messages enter moderation before becoming publicly visible.
- Current admin username: `asdf`.
- Admin moderation queue with approve/reject controls and auditable status.
- Source-backed/system messages may bypass moderation only when a proven existing Awtsmoos source contract already distinguishes them.
- Blog/posting surface in addition to chat.
- Blog post comments using existing Awtsmoos comment primitives.
- Reuse existing social network profiles, aliases, posts, comments, media and auth APIs.
- Navigation entry points added coherently to the Chabad site after the social module is proven.

## Possible UI architecture

- `community.html`: app shell with chat-first layout.
- `communityApp.js`: orchestration only.
- `communityAuthClient.js`: Awtsmoos session/auth adapter.
- `communityRoomClient.js`: existing room/chat adapter.
- `communityModerationPolicy.js`: approval-state rules.
- `communityMessageComposer.js`: text/media input state.
- `communityMessageView.js`: message bubble rendering.
- `communityMediaView.js`: images and accessible gallery.
- `communityModerationView.js`: admin queue for `asdf`.
- `blog.html`: posts timeline/editor.
- `blogApp.js`, `blogPostClient.js`, `blogPostView.js`, `blogCommentClient.js`, `blogCommentView.js`.
- Shared community CSS split into shell, messages, composer, media, moderation and responsive modules.

These names are candidates only until the native repository reveals the real Awtsmoos primitives and naming patterns.

## Safety and integrity gates

- Never trust a client-side `asdf` check as authorization; server/platform authorization must enforce admin behavior.
- Never expose private auth/session secrets into Virtual OS source.
- Never bypass existing Awtsmoos permissions to manufacture an identity.
- Never let unapproved community content appear publicly if the moderation rule applies.
- Preserve provenance: source-backed/system content must remain distinguishable from user-authored content.
- Sanitize user text/media metadata and use native rendering helpers where they already exist.
- Images require file-size/type constraints and server-owned upload paths.
- Mobile UX must work at narrow widths before adding desktop frosting.

## REMAINING_WORK

### Mission A
- [ ] Final exact write-set artifact.
- [ ] Whole-file source rewrites.
- [ ] Source re-read.
- [ ] Syntax/runtime checks.
- [ ] Publication/deployment refresh.
- [ ] Mobile/desktop live verification.
- [ ] Remaining UI/UX audit closure.

### Mission B
- [ ] Native auth/social/message/comment/media archaeology.
- [ ] Existing chat/WhatsApp-like UI archaeology.
- [ ] Moderation/permissions archaeology.
- [ ] Blog/post primitives archaeology.
- [ ] Exact integration architecture.
- [ ] Three-pass social implementation plan after evidence.
- [ ] Whole-file implementation.
- [ ] Admin and user workflow tests.
- [ ] Responsive/accessibility tests.
- [ ] Production integration and handoff.

## NEXT_ACTION

Close Mission A completely before beginning social implementation.
