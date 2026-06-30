# B"H

# Cross-platform realtime compile + GGUF conversion + low-RAM real chat plan

## User command

Make the native addon compile in realtime for Linux, macOS, and Windows. No CMake. No external build system. Every source is raw C in the repo. Try to convert GGUF to custom `.awtai-db`, and try to get a real chat result with minimum RAM by trading RAM for more temporary disk space.

## Reality map

Existing converter:

- `bin/convert.js input.gguf [out.awtai-db]`
- `download-cheap-chat-gguf.js` downloads TinyLlama Q2_K GGUF into `~/Documents/awtai-db-models`.
- `bin/fast-lowram-sentence.js` is the most direct low-RAM runner.
- `bin/real-chat.js` is the more general chat runner.

Existing native build has already been moved to:

- `native/build-manifest.json`
- `native/build.sh`
- `../awtsmoos/compiling/native/rawCAddonBuilder.mjs`

## Cross-platform compile actions

Improve `rawCAddonBuilder.mjs` so it knows these platform shapes:

- macOS: `clang -bundle -undefined dynamic_lookup ... -o awtai_native.node ...`
- Linux: `cc/clang/gcc -shared -fPIC ... -lm -o awtai_native.node ...`
- Windows MSVC/clang-cl: `/LD /Fe:awtai_native.node ... node.lib /LIBPATH:<node lib dir>`
- Windows MinGW clang/gcc: `-shared ... -L<node lib dir> -lnode -o awtai_native.node ...`

Add `native/build.cmd` for Windows realtime build.

The builder remains repo-owned and manifest-driven. It does not use CMake.

## Real chat attempt plan

1. Search bounded common model locations for `.awtai-db` and `.gguf`.
2. If `.awtai-db` exists, run low-RAM chat directly.
3. Else if `.gguf` exists, run `node bin/convert.js model.gguf model.awtai-db`, then run low-RAM chat.
4. Else try the existing TinyLlama Q2_K downloader, convert it, and run low-RAM chat.

Low-RAM settings:

```sh
AWTAI_TENSOR_CACHE_BYTES=0
AWTAI_MMAP_LM_HEAD=1
AWTAI_NATIVE_MODEL_MAP=1
AWTAI_NATIVE_ATTENTION=1
AWTAI_MAX_RAM_KV=0
AWTAI_PROMPT_TOKENS=1
AWTAI_MAX_NEW=1
```

Temp disk tradeoff:

- Keep tensor cache at 0.
- Spill KV to scratch/disk.
- Use mmap LM-head top-k.
- Preserve `.awtai-db` as canonical model.

## Caveat

If no local model is found and network download is blocked or too large for the current session, report exactly which command was attempted and why the real chat could not complete.
