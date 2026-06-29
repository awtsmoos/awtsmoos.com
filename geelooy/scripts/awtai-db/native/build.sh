#!/usr/bin/env bash
# B"H
set -euo pipefail
cd "$(dirname "$0")"
NODE_BIN="${NODE_BIN:-$(command -v node)}"
NODE_ROOT="$(dirname "$(dirname "$NODE_BIN")")"
NODE_INC="$NODE_ROOT/include/node"
OUT="awtai_native.node"
clang -O3 -pthread -DNAPI_VERSION=10 -I "$NODE_INC" -bundle -undefined dynamic_lookup \
  -o "$OUT" addon.c awtai_project_threaded.c awtai_fused_ffn.c \
  awtai_quant_dispatch.c awtai_quant_q2k.c awtai_quant_q3k.c \
  awtai_quant_q4k.c awtai_quant_q6k.c
printf 'B"H built %s\n' "$PWD/$OUT"
