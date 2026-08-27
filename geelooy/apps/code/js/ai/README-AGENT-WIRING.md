# B"H

# Autonomous Vibe Agent Wiring

This folder adds the missing architecture for the AI coding UI.

## Main fixes

1. The filesystem provider now rejects missing provider identity early.
2. Git commit context is validated before remote upload.
3. GitHub commit happens once, after all files are uploaded.
4. Local `.awtsmoos-repo/ikar.js` anchor writes inherit the correct provider type.
5. Agent timeline phases replace frozen "waiting first spark" UI.
6. Tool calls render collapsed by default.
7. File edits/creates/tests/commits can stream as readable phases.

## Required stream integration

Wherever the AI API currently handles stream events, import:

```js
import { agentStreamController } from './agent/stream-controller.js';