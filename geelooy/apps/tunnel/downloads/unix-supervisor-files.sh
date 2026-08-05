#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# One declarative garment list prevents installed guardians from missing a helper.
supervisor_runtime_pairs() {
	cat <<'PAIRS'
unix-node-runtime.sh:awtsmoos-node-runtime.sh
unix-legacy-catalog.sh:awtsmoos-legacy-catalog.sh
unix-emergency-runtime.sh:awtsmoos-emergency-runtime.sh
unix-supervisor.sh:awtsmoos-supervisor.sh
unix-supervisor-runtime.sh:awtsmoos-supervisor-runtime.sh
unix-supervisor-agents.sh:awtsmoos-supervisor-agents.sh
unix-supervisor-guard.sh:awtsmoos-supervisor-guard.sh
unix-supervisor-health-memory.sh:awtsmoos-supervisor-health-memory.sh
unix-supervisor-receipt.sh:awtsmoos-supervisor-receipt.sh
unix-supervisor-health.sh:awtsmoos-supervisor-health.sh
unix-supervisor-recovery.sh:awtsmoos-supervisor-recovery.sh
unix-supervisor-identity.sh:awtsmoos-supervisor-identity.sh
unix-supervisor-emergency.sh:awtsmoos-supervisor-emergency.sh
unix-supervisor-legacy.sh:awtsmoos-supervisor-legacy.sh
unix-agent-singleton.cjs:awtsmoos-agent-singleton.cjs
unix-agent-receipt.cjs:awtsmoos-agent-receipt.cjs
unix-agent-identity.cjs:awtsmoos-agent-identity.cjs
unix-agent-launcher.cjs:awtsmoos-agent-launcher.cjs
PAIRS
}
