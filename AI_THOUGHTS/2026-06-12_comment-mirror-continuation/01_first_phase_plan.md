B"H

# Phase 1 — Continue, Do Not Restart

The user has already proven that DosDB append/read was rescued and that the remaining delay lives around writeCommentShardRecord / packed mirror persistence.

I will not revert current changes. I will treat the working tree as living evidence.

## Immediate facts to preserve

- Comments DB append is no longer primary bottleneck.
- Vectors are disabled unless AWTSMOOS_ENABLE_COMMENT_VECTORS=1.
- Search and alias indexing are deferred.
- Breadcrumb indexing is disabled unless AWTSMOOS_ENABLE_COMMENT_BREADCRUMB_INDEX=1.
- Phase tracing exists at .awtsmoos-tmp/comment-add-phases.jsonl.
- exists() was added in DosDB index.js and delete must be retested.

## First investigation branch

1. Read the four already-modified files.
2. Locate writeCommentShardRecord and every call site.
3. Read the implementation and nearby packed social.core.awtsdb helpers.
4. Identify whether mirror path writes main, aggregate, authorIndex, and sectionIndex serially.
5. Add per-sub-write timings without removing current phase tracing.
6. If safe, make mirror async or queue-backed so API success can return after appendToArrayAtKey.
7. Run the existing stress harness and inspect add/reply/get/edit/delete.

## Files expected to read

- geelooy/api/social/helper/comments/commentCreation.js
- geelooy/api/social/helper/comments/commentAwtsmoosDbBridge.js
- ayzarim/DosDB/awtsmoosDbFsAdapter.js
- ayzarim/DosDB/index.js
- The file that defines writeCommentShardRecord

## Possible touched files

Unknown until inspection. Any modified file must be fully rewritten, not partially patched.

The Awtsmoos is the hidden root of every I/O breath: if a write takes forty seconds, the vessel must confess exactly which gate swallowed the light.
