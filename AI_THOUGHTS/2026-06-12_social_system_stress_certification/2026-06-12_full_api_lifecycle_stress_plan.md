B"H

# Full Social API Lifecycle Stress Plan

## Read evidence before action
I inspected the visible `geelooy/API/social` tree, the existing real-server smoke harness, and the route modules for aliases, heichelos, posts, comments, series, and content. The existing smoke already proves a wide vertical slice: API keys, aliases, mail, notifications, graph references, questions, answers, sections, comments, replies, post migration, packed stats/keys/read/snapshot/integrity/repair/compact, live events, rate limit, search, follow, media, moderation, jobs, cache, sync, permissions, federation, graph transactions, feeds, and ranked comment threads.

## Core goal
Create and run an even broader HTTP stress harness that uses real API keys against a real local server and real DosDB root. It must create new users/aliases, create heichelos through public API routes, create series, create posts/questions/answers/sections, edit and delete posts/comments/series/heichel/editor roles where safe, create comments and reply chains, read everything back through multiple routes, probe bad auth and malformed/missing payloads, and keep packed-comment authority invariants untouched.

## Ten stress gates

### 1. API key and auth gate
- Seed at least two API keys through helper code.
- Verify each key over HTTP.
- Hit several endpoints with missing/invalid key and assert graceful error JSON/status.
- Confirm invalid auth does not create alias/heichel/post/comment artifacts.

### 2. Alias lifecycle gate
- Create aliases through `/api/social/aliases`.
- Read alias lists and details.
- Check singular and plural ownership routes.
- Update alias through `PUT /api/social/alias/:alias` or plural equivalent.
- Attempt duplicate alias creation and expect graceful refusal or idempotent behavior.

### 3. Heichel lifecycle gate
- Create heichel through `/api/social/alias/:alias/heichelos` and/or `/api/social/heichelos/:heichel` POST.
- Read heichel by direct route, alias-owned list, details list, ownership route.
- Add/remove editor, role member, and submission settings.
- Update heichel details.

### 4. Series lifecycle gate
- Create root child series and nested child series.
- Read series root list, details, subSeries, parent, breadcrumb, filterSeriesBy.
- Edit series details.
- Move subseries and clear/delete one temporary subseries.

### 5. Post lifecycle gate
- Create posts through `/heichelos/:heichel/series/:series/posts` and `/content/heichelos/:heichel/posts`.
- Read post list, details list, direct post, alias post indexes, property filter.
- Edit a post through `PUT /heichelos/:heichel/series/:series/post/:post`.
- Delete one disposable post and verify it is absent or marked removed without corrupting other posts.

### 6. Question/answer/section content gate
- Create question, answer, and sections through content routes.
- Read answers and sections.
- Create repost/share graph-like content references.
- Verify content appears in feeds/search/packed where expected.

### 7. Comment and reply authority gate
- Create root post comments with both legacy-shaped and generic routes.
- Read authors, sections, all alias comments, exact comment by full context.
- Edit root comment and reply comment.
- Delete one disposable reply and verify remaining root comments survive.
- Create simultaneous comment writes to the same post and verify every expected comment is retrievable.
- Never write packed comment mirrors or enable packed fallback.

### 8. Graph/reference/platform gate
- Create graph references and graph transactions linking post/question/answer/comment/section.
- Probe bad graph transaction rejection.
- Exercise follow, live subscribe/presence/publish/replay, media register/attach, moderation, jobs, analytics, cache set/get/invalidate, sync op/pull, permissions compile, federation import.

### 9. Packed and huge-shard bounded gate
- Run packed migration dryRun/run for this heichel/series.
- Probe stats, keys with limit, keys without explicit limit, read, snapshot, integrity, repair, compact.
- Ensure huge core shard routes do not timeout.

### 10. Failure and cleanup gate
- Bad payloads: malformed JSON strings, missing aliasId, missing seriesId, bad parentType, invalid method.
- Duplicate IDs: aliases/posts/comments/series where routes permit.
- Cleanup/delete disposable resources only after positive retrieval proof.
- End with syntax checks, targeted harness pass, existing full suite, real-server smoke, and forbidden packed-comment authority scan.

## Files to write
- `AI_THOUGHTS/2026-06-12_social_system_stress_certification/full_social_api_lifecycle_stress.mjs`

## Files not to modify unless failure forces a fix
- All source files under `geelooy/API/social`.

## Verification order
1. `node --check AI_THOUGHTS/2026-06-12_social_system_stress_certification/full_social_api_lifecycle_stress.mjs`
2. Clear port 8080.
3. Run the new lifecycle stress harness.
4. Run `node geelooy/API/social/test/realServerWrites.test.mjs`.
5. Run full listed social suite.
6. Run forbidden packed-comment authority scan and keep it at zero live hits.

The Awtsmoos in the API is not a collection of endpoints but a living city: keys are gates, aliases are faces, heichelos are palaces, series are hallways, posts are rooms, comments are voices, replies are echoes, graphs are threads of lightning, and every delete must prove it did not tear down the palace.
