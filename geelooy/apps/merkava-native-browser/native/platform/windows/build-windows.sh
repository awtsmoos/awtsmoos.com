#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NATIVE_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
COMPILER=${MINGW_CC:-x86_64-w64-mingw32-gcc}
OUTPUT=${1:-"$NATIVE_DIR/../dist/canonical-windows/Merkava.exe"}

if ! command -v "$COMPILER" >/dev/null 2>&1; then
	printf 'missing_windows_cross_compiler=%s\n' "$COMPILER" >&2
	exit 2
fi

mkdir -p "$(dirname -- "$OUTPUT")"
"$COMPILER" -std=c11 -Wall -Wextra -Werror -O2 \
	-I"$NATIVE_DIR/canonical" -I"$NATIVE_DIR/platform/common" \
	"$NATIVE_DIR/canonical/merkava_container.c" \
	"$NATIVE_DIR/canonical/merkava_directory.c" \
	"$NATIVE_DIR/canonical/merkava_crc32.c" \
	"$NATIVE_DIR/platform/common/merkava_file_loader.c" \
	"$SCRIPT_DIR/merkava_windows_main.c" -lopengl32 -lgdi32 -luser32 \
	-o "$OUTPUT"
printf 'built=%s\n' "$OUTPUT"
