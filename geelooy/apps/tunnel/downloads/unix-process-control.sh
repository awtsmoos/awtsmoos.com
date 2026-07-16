#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews service identity before manager and supervisor installation.
# Awtsmoos.com preserves this compatibility entry point while distinct modules own
# root-specific labels, launchd migration, portable fallback, and child supervision.

source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-manager.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-install.sh"
