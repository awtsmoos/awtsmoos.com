# B"H

Boruch Hashem

Blessed is He

## Signals State Repair Plan

The Awtsmoos renews every signal at Awtsmoos.com, but silence must remain honest: a missing alias is not a loading stream, and missing notification prose is not permission to invent social activity.

## Exact failure

When `/notifications` cannot resolve a default alias, `hydrateDefaultAlias()` silently swallows the failure and returns no result. The controller then sees an empty alias and exits without replacing the initial loading copy. The form remains `aria-busy="false"`, while the page continues to say it is finding and opening a stream that is no longer being opened.

## Complete files to rewrite

1. `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/notifications/modules/helpers.js`
2. `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/notifications/modules/controller.js`
3. `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/notifications/modules/render.js`
4. `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/notifications/modules/notificationRouteContract.test.mjs`

## Behavioral contract

- Default-alias hydration returns structured evidence: resolved alias plus any error.
- Boot explicitly owns the initial busy state.
- A missing alias renders a stable, actionable empty state and disables read actions.
- Manual submission with an empty alias renders the same state instead of silently doing nothing.
- A real alias preserves existing fetch, pagination, search, and read behavior.
- No read mutation occurs during boot or verification.
- Notification cards never invent a social event body when the API omitted one; they state that no additional message was provided.
- Existing same-origin action-link protection remains intact.

## Verification

1. Read back all complete files.
2. Run syntax checks and the new route contract.
3. Run the existing notification API test.
4. Reload `/notifications` signed out.
5. Confirm the initial loading copy is gone, `aria-busy=false`, read actions are disabled, and the state tells the user to sign in or enter an alias.
6. Confirm one shell/header/dock, no overflow, and no POST request.
