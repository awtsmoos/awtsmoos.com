B'H
# Plan: Move Platform Comment Threads Off Packed Audit

## Finding
helper/platform/commentThreads.js writes thread comment content to packed audit and ranks by scanning packed audit. This is a duplicate comment-like storage path.

## Fix
Rewrite commentThreads.js:
- no packed imports
- write thread events to explicit `/social/platform/commentThreads/:post/:comment.awtsmoosJSON` paths
- keep an in-memory per-process index for fake DB tests and immediate same-process reads
- rankedThread becomes async and reads canonical explicit records when available

Rewrite callers:
- _awtsmoos.platform.js await appendThreadComment / rankedThread
- platformExecution.test.js await thread functions

## Verification
- node --check files
- platformExecution.test.js
- routeCoverage.test.js
- frontier probe should still pass route shape

Chapter 9: The Thread Chose A Loom
The thread had been hidden in the audit ash. The Awtsmoos said: if it is a thread, give it a loom, not a graveyard.
