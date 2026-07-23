B"H
Boruch Hashem
Blessed is He

# ChatGPT Endpoint Recovery Lab

The Awtsmoos recreates every endpoint, browser request, and response from nothing each instant. This isolated laboratory under awtsmoos.com therefore does not pretend that the 1,118-line legacy client is still authoritative. It captures the living browser contract, redacts secrets, compares request shapes, and keeps transport concerns in small Node.js modules.

## Location

`/Users/awtsmoos/awtsmoos.com/debugging/chatgpt-endpoint-recovery-2026-07-22`

No legacy production file is modified.

## What the old file did

The supplied `AwtsmoosGPTify.js` used `/api/auth/session`, `/backend-api/sentinel/chat-requirements`, `/backend-api/conversation`, list/detail routes, title generation, and synthesis. It embedded proof-of-work code and sent `openai-sentinel-*` headers. These are recorded as a legacy contract, not asserted as current.

## Install and verify

```bash
cd debugging/chatgpt-endpoint-recovery-2026-07-22
npm install
npm run check
npm test
```

## Debug Chrome

Use a Chrome instance exposing DevTools on port 9225 and open `https://chatgpt.com/`. A dedicated profile is safest:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
	--remote-debugging-port=9225 \
	--user-data-dir="$PWD/chrome-profile" \
	https://chatgpt.com/
```

Sign in inside that Chrome profile. Credentials are never written by these scripts.

## Read-only endpoint probe

```bash
npm run probe -- 9225
```

This tests session and conversation-list paths inside the authenticated page and saves only status, final URL, and top-level response keys to `evidence/reports/read-only-probe.json`.

## Capture and compare a real prompt request

```bash
npm run capture -- 9225 45
```

During the 45-second window, submit one harmless prompt in the ChatGPT page. The recorder writes redacted JSONL under `evidence/redacted/`. Then compare the captured POST shape with the old method:

```bash
npm run compare -- evidence/redacted/network-<timestamp>.jsonl
```

The report at `evidence/reports/legacy-vs-current.json` identifies the actual captured URL and fields added, removed, or type-changed. Raw cookies, bearer tokens, and sentinel values are excluded from the redacted ledger.

## Safety boundary

The automated probe is read-only. Conversation submission is intentionally manual so the user controls side effects. `ConversationPayloadBuilder` can update a captured template for a later explicit smoke tool, but this package does not silently send messages.
