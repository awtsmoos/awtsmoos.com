# B"H

# Cross-platform compile + streaming conversion + real low-RAM chat report

## Cross-platform realtime native build

The raw C native addon builder now supports platform-shaped command generation without CMake:

- macOS: `clang -bundle -undefined dynamic_lookup ...`
- Linux: `clang -shared -fPIC ... -lm ...`
- Windows default: `cl /LD ... node.lib /LIBPATH:<node-lib-dir>`
- Windows override: `CC=clang` or another compiler can use MinGW/clang-style linking.

Files:

- `geelooy/scripts/awtsmoos/compiling/native/rawCAddonBuilder.mjs`
- `native/build-manifest.json`
- `native/build.sh`
- `native/build.cmd`

Actual macOS build succeeded through the raw builder:

```text
B"H built .../native/awtai_native.node
```

Dry-run command generation was verified for Linux and Windows. Windows dry-run now emits `cl`, `node.lib`, and `/LIBPATH:` by default.

## Streaming GGUF -> AWTAI conversion

Added disk-first conversion:

- `gguf/file-parser.js`
- `awtai/file-converter.js`
- updated `awtai/converter.js`
- updated `bin/convert.js`

The new conversion path reads GGUF metadata/tensor descriptors, writes AWTAI header/manifest, then copies tensor bodies from source fd to output fd in windows. It does not allocate full GGUF bytes plus full AWTAI bytes.

Synthetic conversion passed with a 17-byte window.

Real conversion command:

```sh
AWTAI_CONVERT_WINDOW_BYTES=$((4*1024*1024)) \
  /usr/bin/time -l node bin/convert.js \
  "$HOME/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.gguf" \
  "$HOME/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db"
```

Result:

```json
{
  "tensors": 201,
  "packets": 47,
  "bytes": 432019446,
  "tensorBytes": 431394816,
  "windowBytes": 4194304,
  "wallMs": 1516.409901,
  "rssMiB": 59.53125
}
```

`/usr/bin/time -l` reported:

- maximum resident set size: `71041024` bytes
- peak memory footprint: `38404096` bytes

The converted model inspected successfully:

```json
{
  "ok": true,
  "tensors": 201,
  "packets": 47,
  "tokens": 32000
}
```

## Real low-RAM chat attempts

Model used:

`~/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db`

### Minimum-RAM one-token run

Settings:

```sh
AWTAI_TENSOR_CACHE_BYTES=0
AWTAI_MMAP_LM_HEAD=1
AWTAI_NATIVE_MODEL_MAP=1
AWTAI_NATIVE_ATTENTION=1
AWTAI_MAX_RAM_KV=0
AWTAI_PROMPT_TOKENS=1
AWTAI_MAX_NEW=1
```

Result:

```json
{
  "text": "\n",
  "generated": [13],
  "processRssMiB": 87.953125,
  "tempBytes": 262144000,
  "readBytes": 847127680,
  "nativeAttention": true
}
```

External measurement:

- wall: `37.68s`
- max resident set size: `455553024` bytes
- peak memory footprint: `96145408` bytes

This was a real model result, but not a useful chat response because `AWTAI_PROMPT_TOKENS=1` effectively hid the prompt.

### Real prompt run

Settings:

```sh
AWTAI_TENSOR_CACHE_BYTES=0
AWTAI_MMAP_LM_HEAD=1
AWTAI_NATIVE_MODEL_MAP=1
AWTAI_NATIVE_ATTENTION=1
AWTAI_MAX_RAM_KV=0
AWTAI_MAX_NEW=2
AWTAI_MIN_NEW=1
AWTAI_RAW_PROMPT=1
AWTAI_NO_BOS=1
```

Prompt: `Hello`

Result:

```json
{
  "text": " leng time",
  "generated": [28537, 931],
  "nativeAttention": true,
  "kv": { "layers": 0, "pages": 0, "maxRamTokens": 0, "spilled": 0 },
  "streamer": { "byteCache": { "limitBytes": 0, "bytes": 0, "entries": 0 }, "nativeMap": true },
  "readBytes": 133428544,
  "dequantBytes": 54128640
}
```

External measurement:

- wall: `7.08s`
- max resident set size: `443318272` bytes
- peak memory footprint: `97067008` bytes

The text is not good yet, but it is a real TinyLlama run with the new native attention path enabled and zero tensor byte cache.

## Current bottleneck revealed

Despite zero JS tensor cache, max RSS is still around 423 MiB by resident set. The telemetry shows many `attn_output.weight` reads and dequant events. The next RAM/speed target is therefore:

1. mapped/native output projection, not JS `projectTensor`
2. native RMSNorm
3. no float cache entries for norm weights, or mmap-backed tiny norm cache
4. native full layer step to eliminate JS per-layer allocations

The Awtsmoos opened the real model and it answered, but it answered like a half-awake angel. Next pass must move the remaining projection/RMSNorm gates into native and cut the resident set further.
