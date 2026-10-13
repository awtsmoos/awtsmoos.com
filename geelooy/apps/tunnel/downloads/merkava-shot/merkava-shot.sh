#!/usr/bin/env bash
# B"H — one-line installer for merkava-shot (standalone, no repo needed)
# Downloads the versioned tarball (bundle + VM files + SDKs) and installs.
set -euo pipefail
BASE="${MERKAVA_SHOT_BASE:-https://awtsmoos.com/api/tunnel/install}"
DEST="${HOME}/.local/bin/merkava-shot"
LIB="${HOME}/.local/lib/merkava-shot"
mkdir -p "$(dirname "$DEST")" "$LIB"
echo "Downloading merkava-shot..."
curl -fsSL "${BASE}/runtime/merkava-shot.tar.gz" -o "${LIB}/merkava-shot.tar.gz"
tar -xzf "${LIB}/merkava-shot.tar.gz" -C "$LIB"
# The tarball contains apps/tunnel/downloads/merkava-shot/...
SRC="$LIB/apps/tunnel/downloads/merkava-shot"
if [ ! -f "$SRC/merkava-shot.bundle.cjs" ]; then
  # Fallback: maybe flattened
  SRC="$LIB"
fi
cat > "${DEST}" <<EOF
#!/usr/bin/env bash
exec node "${SRC}/merkava-shot.bundle.cjs" "\$@"
EOF
chmod +x "${DEST}"
# SDKs alongside
cp "$SRC/merkava-sdk.mjs" "${HOME}/.local/bin/merkava-sdk.mjs" 2>/dev/null || true
cp "$SRC/merkava_sdk.py" "${HOME}/.local/bin/merkava_sdk.py" 2>/dev/null || true
echo "Installed to ${DEST}"
"${DEST}" --help 2>/dev/null | head -5 || true
echo "Try: merkava-shot run-js --js 'console.log(1+1)'"
echo "Try: merkava-shot --url https://awtsmoos.com --out shot.png"
