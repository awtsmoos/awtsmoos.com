# B"H

# Mmap LM-Head Top-K Results

## Files changed

- `native/awtai_mmap_project.h`
- `native/awtai_mmap_project.c`
- `native/addon.c`
- `native/native-matvec.js`
- `native/build.sh`
- `execution/lm-head.js`
- `decode/token-runner.js`
- `decode/chat-loop.js`
- `bin/fast-lowram-sentence.js`
- `ai-thoughts/20260629-0853-performance-50ms-lowram/09-mmap-lm-head-plan.md`
- `ai-thoughts/20260629-0853-performance-50ms-lowram/10-mmap-lm-head-results.md`

## Native load check

Command:

```bash
cd /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com
node - <<'NODE'
const { nativeStatus } = require('./geelooy/scripts/awtai-db/native/native-matvec.js');
console.log(JSON.stringify(nativeStatus(), null, 2));
NODE
```

Result:

```json
{
  "active": true,
  "supported": [10, 11, 12, 14],
  "threads": 4,
  "fusedFfn": true,
  "f32Project": true,
  "mmapF32TopK": true,
  "error": null
}
```

## Fast low-RAM gate command

```bash
cd /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com
/usr/bin/time -l node geelooy/scripts/awtai-db/bin/fast-lowram-sentence.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.awtai-db "Write one sentence."
```

## Measured output

```json
{
  "ok": true,
  "text": "\nThe sun is",
  "generated": [13, 1576, 6575, 338],
  "wallMs": 44859.525821,
  "processRssMiB": 90.32421875,
  "tempBytes": 262144000,
  "readBytes": 7880911296,
  "tokenPasses": 22,
  "msPerTokenPass": 2039.0693555,
  "deletedTemp": true
}
```

`/usr/bin/time -l` reported:

```text
45.05 real
168771584 maximum resident set size
```

Max RSS MiB:

```text
160.952 MiB
```

## Verdict

The hard gate did not pass.

- wall target: <= 5000 ms
- measured wall: 44859.525821 ms from process JSON; 45.05 s from `/usr/bin/time -l`
- RSS target: <= 50 MiB
- measured max RSS: 168771584 bytes = 160.952 MiB

## Honest bottleneck

The LM-head top-k now avoids returning a full logits array and the F32 LM head is a disposable file, not a JS heap slab. The text stayed coherent and identical to the previous baseline. However, the full transformer path still rereads almost the entire model repeatedly because tensor cache is zero and attention/FFN projections are still packed scalar/native-per-call rather than mmap/windowed layer slabs. The measured read volume was 7.88 GB.

## Next work

The next bottleneck is not LM-head top-k. It is transformer layer execution. The next slice should move active-layer attention and FFN projections to disposable slabs or native packed-row direct file projection, one layer at a time, so the model does not reread gigabytes for a four-token sentence.
