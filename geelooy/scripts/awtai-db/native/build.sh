#!/usr/bin/env bash
# B"H
set -euo pipefail
cd "$(dirname "$0")"
node ../../awtsmoos/compiling/native/rawCAddonBuilder.mjs build-manifest.json
