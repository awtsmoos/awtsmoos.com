# B"H

# Runtime Pack Implementation Pass

## Design decision
There is still one canonical model format: `.awtai-db`.

No `.awtai-db v2` was created. The implementation creates disposable runtime cache files derived from the canonical `.awtai-db` and deletes them after use unless `--keep` is explicitly passed for inspection.

## Files added

- `runtime/run-cache.js`
- `profiling/timer.js`
- `prepack/tensor-groups.js`
- `prepack/pack-format.js`
- `prepack/layer-pack-writer.js`
- `prepack/pack-reader.js`
- `prepack/pack-projector.js`
- `bin/prepack-model-cache.js`
- `bin/inspect-pack.js`
- `bin/test-pack-project.js`

## File rewritten fully

- `profiles/low-ram-profile.js`

It now defaults `tensorCacheBytes` to zero and records runtime pack policy fields.

## Pack format

Runtime packs use:

- magic: `AWTPACK1`
- 8-byte little-endian JSON header length
- JSON manifest with tensor names, types, dims, byte lengths, payload offsets
- raw tensor payload copied from `.awtai-db`

These files are not model files. They are disposable run caches.

## Validation run

Command:

```bash
node geelooy/scripts/awtai-db/bin/prepack-model-cache.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.awtai-db --layers 1 --keep
```

Result:

- packCount: 3
- packBytes: 91,461,478
- write-packs: 709.863416 ms
- cache: `/var/folders/m2/19fzy8_n0w9_hfhxrgbwqbs40000gn/T/awtai-run-tGUV5X`

The temporary cache was later deleted manually after inspection.

## Pack header inspection

The generated attention pack contained:

- `blk.0.attn_norm.weight`
- `blk.0.attn_q.weight`
- `blk.0.attn_k.weight`
- `blk.0.attn_v.weight`
- `blk.0.attn_output.weight`

with exact type/dim/byteLength/payloadOffset metadata.

## Projection parity test

Command:

```bash
node geelooy/scripts/awtai-db/bin/test-pack-project.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.awtai-db /var/folders/m2/19fzy8_n0w9_hfhxrgbwqbs40000gn/T/awtai-run-tGUV5X/layers/000.attention.awtpack blk.0.attn_q.weight
```

Result:

```json
{
  "ok": true,
  "length": 2048,
  "maxAbs": 0,
  "maxIndex": -1
}
```

This proves pack projection currently matches the canonical `.awtai-db` tensor projection exactly for `blk.0.attn_q.weight`.

## Module load validation

All new core modules loaded successfully:

```json
{"ok":true,"modules":8}
```

## Current status

The project now has a real one-format runtime prepack foundation:

`.awtai-db -> disposable AWTPACK runtime cache -> pack projector`

This does not yet implement fused native whole-layer decode, but it creates the safe byte layout and exact parity bridge needed for the next native fusion pass.
