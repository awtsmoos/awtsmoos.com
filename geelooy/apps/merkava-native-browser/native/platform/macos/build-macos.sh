#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NATIVE_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
APP_DIR=${1:-"$NATIVE_DIR/../dist/canonical-macos/Merkava.app"}
BUILD_DIR="$APP_DIR/Contents/Build"
BIN_DIR="$APP_DIR/Contents/MacOS"
RES_DIR="$APP_DIR/Contents/Resources"
X64_BIN="$BUILD_DIR/Merkava-x86_64"
ARM_BIN="$BUILD_DIR/Merkava-arm64"
FINAL_BIN="$BIN_DIR/Merkava"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$BIN_DIR" "$RES_DIR"

"$SCRIPT_DIR/build-macos-arch.sh" x86_64 "$BUILD_DIR/x86_64" "$X64_BIN"
"$SCRIPT_DIR/build-macos-arch.sh" arm64 "$BUILD_DIR/arm64" "$ARM_BIN"
lipo -create "$X64_BIN" "$ARM_BIN" -output "$FINAL_BIN"

cat > "$APP_DIR/Contents/Info.plist" <<'PLIST'
<!--B"H-->
<!--Boruch Hashem-->
<!--Blessed be He-->
<plist version="1.0"><dict>
	<key>CFBundleExecutable</key><string>Merkava</string>
	<key>CFBundleIdentifier</key><string>com.awtsmoos.merkava</string>
	<key>CFBundleName</key><string>Merkava</string>
	<key>CFBundlePackageType</key><string>APPL</string>
	<key>CFBundleShortVersionString</key><string>1.0</string>
	<key>LSMinimumSystemVersion</key><string>10.13</string>
	<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST

lipo "$FINAL_BIN" -verify_arch x86_64 arm64
plutil -lint "$APP_DIR/Contents/Info.plist" >/dev/null
printf 'built_universal=%s\n' "$APP_DIR"
