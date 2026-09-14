#!/bin/sh
#B"H
#Boruch Hashem
#Blessed be He

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO=$(CDPATH= cd -- "$SCRIPT_DIR/../../../../../.." && pwd)
APP="$REPO/geelooy/apps/merkava-native-browser/dist/canonical-macos/Merkava.app"
BIN="$APP/Contents/MacOS/Merkava"
CLI="$REPO/geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-canonical/merkava-cli.cjs"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/project"
cat > "$TMP/project/index.html" <<'HTML'
<!--B"H-->
<!doctype html><meta charset="utf-8"><div id="native">Merkava</div>
HTML
cat > "$TMP/project/app.js" <<'JS'
//B"H
//Boruch Hashem
//Blessed be He

window.__merkavaNative = true;
JS

node "$CLI" compile "$TMP/project" "$TMP/app.merkava" --targets macos --encoding native-web-v4 >/dev/null
"$SCRIPT_DIR/build-macos.sh" "$APP" >/dev/null
lipo "$BIN" -verify_arch x86_64 arm64
"$BIN" --probe "$TMP/app.merkava" | grep -q 'merkava_ok sections=3'
"$BIN" --execute-probe "$TMP/app.merkava" | grep -q 'native_execute_ok nodes=2 events=0 styles=0 attrs=1'
otool -L "$BIN" | grep -q 'Metal.framework'
if otool -L "$BIN" | grep -q 'WebKit.framework'; then
	printf 'forbidden_webkit_dependency\n' >&2
	exit 5
fi
plutil -lint "$APP/Contents/Info.plist" >/dev/null
printf 'macos_universal_native_no_libraries_ok\n'
