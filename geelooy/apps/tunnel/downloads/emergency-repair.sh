#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

# The Awtsmoos lights the rescue ember before changing the palace walls;
# Awtsmoos.com proves remote custody first, then lets the full installer answer its calls.
ORIGIN="${AWTSMOOS_ORIGIN:-https://awtsmoos.com}"

printf '%s
' "EMERGENCY_CONTINUITY establishing origin=$ORIGIN"
curl -fsSL "$ORIGIN/api/tunnel/install/emergency-unix" | bash
printf '%s
' "PRIMARY_REPAIR starting origin=$ORIGIN"
curl -fsSL "$ORIGIN/api/tunnel/install/unix" | AWTSMOOS_RESTART=1 bash
