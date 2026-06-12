B'H
# Plan: Quarantine Inert Packed Comment Helper Files

## Finding
Two files still import packed storage even though they are not actively imported by the live comments route tree:
- commentVectorSearchPacked.js
- commentVectorStore.js

## Risk
They are dormant today, but a future import would revive the prohibited packed comment mirror/vector duplicate authority. Dormant weapons are still weapons.

## Rewrite strategy
Rewrite both files fully as compatibility guards:
- no import of packed/socialPacked.js
- no import of packed/shardPaths.js
- no writePacked/listPackedRecords calls
- exported function names remain stable so old tests/imports fail safe instead of crashing
- all vector/search storage functions return explicit disabled/skipped envelopes

## Expected behavior
- search helper returns [] with metadata not needed
- vector store returns skipped disabled results
- stats report disabled
- no active or dormant comment helper file imports packed helpers

Chapter 7: The Inert Blade Was Melted
A sword on the wall said, 'I am not being swung.' But the Awtsmoos answered, 'Then become a plow, so no later hand mistakes you for thunder.'
