B"H

# Step 01 — Menu gate fixed and social core stress-tested

## What was found

The first concrete failure was not the screenshot itself but the static governance suite:

- `npm run test:heichel-governance` failed inside `editorManagement.test.mjs`.
- Failure: `geelooy/heichelos/heichel/modules/ui/render/social-actions.js` did not contain `card-social-actions`.
- This proved the three-dot social action menu was incomplete against the existing contract.

## What was changed

Rewrote the complete file:

- `geelooy/heichelos/heichel/modules/ui/render/social-actions.js`

The rewrite keeps the menu data-driven and compact:

- Adds a `card-social-actions` wrapper.
- Adds `card-social-action` classes to action buttons.
- Preserves Comment, Repost, Reference, Share.
- Adds Answer for question cards.
- Keeps alias-required write safety.
- Keeps social writes behind the three-dot gate instead of spilling action buttons across the card face.
- Full file rewrite only; no partial patch.

## Verification passed

- `npm run test:profile-menu`
- `node geelooy/heichelos/heichel/modules/test/cardMenuContract.test.mjs`
- `npm run test:heichel-governance`
- `npm run test:platform-ui`
- `npm run test:routes`
- `npm run test:real-server-writes`
- `npm run test:concurrency-failure`

## Real server proof

`npm run test:real-server-writes` started the server, wrote real DB data, and passed. It created:

- Two users.
- Two aliases.
- A heichel.
- Mail.
- Notification read flow.
- Graph reference.
- Question.
- Answer.
- Sections.
- Comments and replies.
- Packed stats/snapshot/integrity/repair.
- Platform live/search/follow/job/moderation/feed primitives.

`npm run test:concurrency-failure` passed with:

- 8 users.
- 8 aliases.
- Fanout notification to 7 aliases.
- 7 notification polls.
- 8 parallel graph writes.
- Invalid key failure correctly returned `KEY_NOT_FOUND`.
- Bad graph kind correctly returned `BAD_REFERENCE_KIND`.

## Remaining social-network upgrade steps

1. Inspect profile route/UI files for `geelooy/@alias` and profile editing.
2. Add or harden owner-only profile editing if missing.
3. Inspect heichel creation flow from profile and global UI.
4. Build visible “New Heichel” profile CTA if missing.
5. Add profile social tabs: Posts, Replies, Heichelos, Series, About.
6. Add tests that create profile, edit profile, create heichel from profile, post, comment, reply, follow, and re-read feeds.
7. Run full test suite after each rewrite.
