B"H

# Native Fast Prewrite Plan

Files to rewrite fully:
- geelooy/scripts/awtsmoos/compiling/native/rawCAddonBuilder.mjs: forbid external CC by default, add clear dry-run/status output, require AWTS_ALLOW_EXTERNAL_CC=1 for clang/cl/gcc/MSVC. This preserves existing script but prevents false compliance.
- scripts/awtai-db/bin/bench-chat.js: add nativeFast mode with AWTAI_PERSISTENT_POOL=1, AWTAI_THREADS default, low RAM cache, direct quant LM-head, compiled LM-head off.

Files to add:
- bin/gate-50ms-50mb.js: run a mode, parse result, fail unless msPerToken<=50 and rss<=50MB.
- tests/test-native-builder-policy.js: verify dry-run refuses external compiler unless opt-in.

No file partial patching: all modified files are rewritten whole.
