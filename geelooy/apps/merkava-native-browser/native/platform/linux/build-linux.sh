#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NATIVE_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
CANONICAL="$NATIVE_DIR/canonical"
COMMON="$NATIVE_DIR/platform/common"
COMPILER=${LINUX_CC:-cc}
OUTPUT=${1:-"$NATIVE_DIR/../dist/canonical-linux/merkava"}

if [ "$(uname -s)" != "Linux" ]; then
	printf 'linux_build_requires_linux_or_explicit_cross_toolchain\n' >&2
	exit 2
fi

mkdir -p "$(dirname -- "$OUTPUT")"

$COMPILER -std=c11 -Wall -Wextra -Werror -O2 \
	-I"$CANONICAL" -I"$COMMON" \
	"$CANONICAL/merkava_container.c" \
	"$CANONICAL/merkava_directory.c" \
	"$CANONICAL/merkava_crc32.c" \
	"$CANONICAL/merkava_source_archive.c" \
	"$COMMON/merkava_file_loader.c" \
	"$SCRIPT_DIR/merkava_linux_main.c" \
	-lX11 -lGL \
	-o "$OUTPUT"

printf 'built_native_no_browser_library=%s\n' "$OUTPUT"
