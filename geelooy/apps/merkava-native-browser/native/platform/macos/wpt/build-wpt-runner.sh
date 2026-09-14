#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUTPUT=${1:-"$SCRIPT_DIR/merkava-wpt"}
SDK=$(xcrun --sdk macosx --show-sdk-path)

clang \
	-fobjc-arc \
	-Wall \
	-Wextra \
	-Werror \
	-O2 \
	-isysroot "$SDK" \
	"$SCRIPT_DIR/WptHarnessScript.m" \
	"$SCRIPT_DIR/WptRunner.m" \
	"$SCRIPT_DIR/WptRunnerDelegates.m" \
	"$SCRIPT_DIR/merkava_wpt_main.m" \
	-framework Cocoa \
	-framework WebKit \
	-o "$OUTPUT"

printf 'wpt_runner=%s\n' "$OUTPUT"
