# B"H — Comment Routes (geelooy/api/social/helper/comments/routes/)

HTTP route handlers for comments, mounted by `_awtsmoos.comments.js`. Covers legacy compat, rich comments, post comments, translations, reactions, indexing, search, and moderation.

## Files
- `index.js` — assembles and exports all comment routes.
- `comment.js` — legacy single-comment/reply routes (GET/POST/PUT/DELETE), delegated to the rich store.
- `post.js` + `postReadOperations.js` + `postMutationOperations.js` — post-level comment trees and mutations.
- `rich.js` — rich comment routes.
- `moderated.js`, `submitted.js` — moderation queue and user submissions.
- `translations.js` — comment translation bundle routes.
- `reactions.js` — comment reactions.
- `search.js` — comment search routes.
- `indexing.js`, `IndexingRouteHandlers.js`, `LegacyIndexReader.js`, `LegacyIndexRebuilder.js` — comment index maintenance.
- `utils.js` — route helpers (`er`, `methodIs`).

## Main endpoints
- `/heichelos/:heichel/comments` (POST create root/reply)
- `/heichelos/:heichel/comment/:comment` (GET/POST/PUT/DELETE single)
- `/heichelos/:heichel/post/:post/comments/` · `/heichelos/:heichel/posts/:post/comments/:comment` (+ `/replies`, `/reactions`, `/sections/:section/replies`)
- `/heichelos/:heichel/posts/:post/comment-tree` · `/heichelos/:heichel/posts/:post/imported-comment-tree`
- `/heichelos/:heichel/post/:post/comments/aliases[/:alias]` — authors commenting
- `/heichelos/:heichel/posts/:post/verses/:verse/comments` · `/heichelos/:heichel/posts/:post/subsections/:subsection/comments`
- `/heichelos/:heichel/series/:series/post/:post/comments/moderated` · `.../translations` (`/coverage`, `/search`)
- `/heichelos/:heichel/questions/:question/comment-tree` · `/heichelos/:heichel/answers/:answer/comment-tree`
- `/aliases/:alias/commentsMade[/heichel/:heichel/series/:series/post/:post]`
- `/entities/:heichel/:entity/comment-tree`
- `/comments/url/:comment`
