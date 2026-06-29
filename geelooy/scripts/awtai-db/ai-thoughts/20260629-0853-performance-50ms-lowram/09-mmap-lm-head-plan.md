# B"H

# Mmap LM-Head Top-K Implementation Plan

## Phase 1: observed reality

The current coherent prompt path is real but slow. The prior evidence says `Write one sentence.` produces `\nThe sun is` with generated ids `[13,1576,6575,338]`, but low-RAM no-cache rereads about 8.04 GB and the cached path holds hundreds of MiB resident. The F32 Accelerate LM head is fast, but the old implementation stores a 250 MiB F32 output head in JS memory, which cannot satisfy the 50 MiB RSS gate.

## Phase 2: smallest honest architecture slice

Implement only the LM-head slice first:

- keep canonical `.awtai-db` untouched
- create a disposable F32 slab file for `output.weight`
- build it in small JS chunks, never as one F32 JS slab
- add native windowed mmap top-k over that slab
- return only top-k ids/logits to JS
- use this opt-in route only for the fast low-RAM CLI
- delete scratch at the end of the run

## Phase 3: exact files to touch

- `native/awtai_mmap_project.h`
- `native/awtai_mmap_project.c`
- `native/addon.c`
- `native/native-matvec.js`
- `native/build.sh`
- `execution/lm-head.js`
- `decode/token-runner.js`
- `bin/fast-lowram-sentence.js`
- this ledger folder, with results after measurement

## Verification gate

Run native load check, rebuild native addon, then run `/usr/bin/time -l node geelooy/scripts/awtai-db/bin/fast-lowram-sentence.js ...`. Success is not claimed unless wall time is <= 5000 ms and max RSS is <= 50 MiB.
