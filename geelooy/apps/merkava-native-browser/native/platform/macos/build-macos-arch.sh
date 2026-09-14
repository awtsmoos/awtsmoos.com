#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

ARCH=${1:?architecture_required}
BUILD_DIR=${2:?build_directory_required}
OUTPUT=${3:?output_required}
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NATIVE_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
CANONICAL="$NATIVE_DIR/canonical"
COMMON="$NATIVE_DIR/platform/common"
VM="$NATIVE_DIR/vm"
RENDER="$NATIVE_DIR/render"
MINIMUM=10.13

if [ "$ARCH" = "arm64" ]; then
	MINIMUM=11.0
fi

mkdir -p "$BUILD_DIR" "$(dirname -- "$OUTPUT")"
FLAGS="-arch $ARCH -mmacosx-version-min=$MINIMUM -Wall -Wextra -Werror -O2"

for SOURCE in merkava_container merkava_directory merkava_crc32 merkava_source_archive; do
	clang -std=c11 $FLAGS -I"$CANONICAL" -I"$COMMON" -I"$VM" \
		-c "$CANONICAL/$SOURCE.c" -o "$BUILD_DIR/$SOURCE.o"
done

clang -std=c11 $FLAGS -I"$CANONICAL" -I"$COMMON" -I"$VM" \
	-c "$COMMON/merkava_file_loader.c" -o "$BUILD_DIR/merkava_file_loader.o"

for SOURCE in merkava_native_reader merkava_native_web_decode merkava_native_web_ops \
	merkava_native_web_records merkava_native_web_runtime merkava_native_canonical; do
	clang -std=c11 $FLAGS -I"$CANONICAL" -I"$COMMON" -I"$VM" -I"$RENDER" \
		-c "$VM/$SOURCE.c" -o "$BUILD_DIR/$SOURCE.o"
done

for SOURCE in merkava_native_style_query merkava_native_css_values merkava_native_css_color \
	merkava_native_layout_style merkava_native_layout merkava_native_hit_test \
	merkava_native_glyphs merkava_native_raster_core merkava_native_raster_text merkava_native_raster_layout; do
	clang -std=c11 $FLAGS -I"$CANONICAL" -I"$COMMON" -I"$VM" -I"$RENDER" \
		-c "$RENDER/$SOURCE.c" -o "$BUILD_DIR/$SOURCE.o"
done

for SOURCE in merkava_macos_presenter merkava_macos_view merkava_macos_main; do
	clang -fobjc-arc $FLAGS -I"$CANONICAL" -I"$COMMON" -I"$VM" -I"$RENDER" \
		-c "$SCRIPT_DIR/$SOURCE.m" -o "$BUILD_DIR/$SOURCE.o"
done

clang -arch "$ARCH" -mmacosx-version-min="$MINIMUM" "$BUILD_DIR"/*.o \
	-framework Cocoa -framework Metal -framework QuartzCore \
	-o "$OUTPUT"

printf 'built_native_arch=%s output=%s\n' "$ARCH" "$OUTPUT"
