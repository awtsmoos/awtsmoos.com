#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NATIVE_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
NDK=${ANDROID_NDK_HOME:-${ANDROID_NDK_ROOT:-}}
API=${ANDROID_API:-26}

if [ -z "$NDK" ] || [ ! -d "$NDK" ]; then
	printf 'missing_android_ndk\n' >&2
	exit 2
fi

HOST_TAG=darwin-x86_64
if [ "$(uname -s)" = "Linux" ]; then HOST_TAG=linux-x86_64; fi
CC="$NDK/toolchains/llvm/prebuilt/$HOST_TAG/bin/aarch64-linux-android${API}-clang"
GLUE="$NDK/sources/android/native_app_glue"
OUTPUT=${1:-"$NATIVE_DIR/../dist/canonical-android/lib/arm64-v8a/libmerkava.so"}

mkdir -p "$(dirname -- "$OUTPUT")"
"$CC" -std=c11 -Wall -Wextra -Werror -O2 -fPIC -shared \
	-I"$NATIVE_DIR/canonical" -I"$GLUE" \
	"$NATIVE_DIR/canonical/merkava_container.c" \
	"$NATIVE_DIR/canonical/merkava_directory.c" \
	"$NATIVE_DIR/canonical/merkava_crc32.c" \
	"$GLUE/android_native_app_glue.c" \
	"$SCRIPT_DIR/merkava_android_asset.c" \
	"$SCRIPT_DIR/merkava_android_egl.c" \
	"$SCRIPT_DIR/merkava_android_main.c" \
	-landroid -llog -lEGL -lGLESv3 -o "$OUTPUT"
printf 'built=%s\n' "$OUTPUT"
