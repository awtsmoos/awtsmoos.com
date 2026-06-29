# B"H

# Persistent Worker Pool Plan

## Why this pass exists

The measured runtime is still thousands of ms/token-pass. The most obvious structural waste is temporary pthread creation inside every projection. A token pass can call projection more than one hundred times, so thread lifecycle overhead becomes a repeating storm.

## Rule

No `.awtai-db` format fork. No v2. No partial file patching. Full-file rewrites only.

## Files to rewrite

- `native/awtai_project_threaded.c`
- `native/awtai_project_threaded.h`
- `native/awtai_fused_ffn.c`

## Intended behavior

Keep the existing C function:

```c
awtai_project_threaded(...)
```

but change the implementation from:

```text
for every projection:
  pthread_create N
  work
  pthread_join N
```

to:

```text
first projection in process:
  create persistent worker threads once

each projection:
  publish job
  wake already-existing workers
  wait for completion
```

## Fused FFN adjustment

The fused FFN file currently creates temporary pthreads for gate/up. That must stop. It will call the persistent `awtai_project_threaded` for gate, up, and down. This may be slightly less fused than the previous gate/up temporary group, but it removes the repeated thread birth/death. A later v2 can add `awtai_project_pair_threaded` using the same pool.

## Validation

After rebuild:

1. Native addon loads.
2. One-token-pass benchmark with `AWTAI_THREADS=8`.
3. Real text prompt `Write one sentence.`.
4. Report wall time and RAM honestly.

## Expected outcome

This may not reach 50ms/token immediately, but it attacks a real architectural defect while preserving the coherent output path.
