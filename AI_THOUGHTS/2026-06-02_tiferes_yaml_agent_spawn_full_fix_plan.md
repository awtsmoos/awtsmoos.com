B"H

# Tiferes YAML + simulated tunnel agent-spawn fix plan

## Problem confirmed

The generated YAML includes agent spawn action names but lacks their working arguments:

- agentId
- apiKey
- prompt
- system
- taskId
- maxDepth
- maxChildrenPerTask
- maxTotalTasks
- allowRecursiveSpawn

The UI now sends these values through `js/api/tunnel.js`, but the GPT/OpenAPI surface and simulated AI bridges must also see them.

## Full fix

1. Rewrite both OpenAPI YAML files with the missing parameters included.
2. Rewrite `geelooy/ai/central/toolSchemas.js` so simulated tunnel tools expose AI-agent actions and AI-agent argument hints.
3. Rewrite `geelooy/apps/code/js/ai/agent/phase-registry.js` so code-app agent timelines understand agent spawn/status/result tools.
4. Run real YAML validation and JS syntax checks.
5. Run a live MiniMax-backed tunnel action using the on-disk/default MiniMax key without printing the secret.

## Safety

No raw MiniMax key will be read or printed. The tunnel already reports the key exists by mask/source; live AI actions can use it internally.
