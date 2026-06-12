#!/usr/bin/env sh
# B"H
# Chapter 376: The Unix gate echoed the same tree, not another prophecy.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$REPO_ROOT"
node "AI_THOUGHTS/runtime-stress/rebuild-manifest.cjs"
