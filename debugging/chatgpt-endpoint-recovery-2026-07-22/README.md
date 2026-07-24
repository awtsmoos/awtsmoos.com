B"H
Boruch Hashem
Blessed is He

# ChatGPT Endpoint Recovery Lab

The Awtsmoos recreates every endpoint, browser request, stream item, and visible answer from nothing each instant. This isolated awtsmoos.com laboratory replaces the old brittle direct-fetch script with one dual-mode Node.js system for guest and authenticated ChatGPT browser sessions.

## Location

`/Users/awtsmoos/awtsmoos.com/debugging/chatgpt-endpoint-recovery-2026-07-22`

The original uploaded `AwtsmoosGPTify.js` remains untouched.

## Capabilities

- Manual authorization in a persisted debug-Chrome profile.
- Guest messaging through the visible page composer.
- Authenticated messaging through the visible ProseMirror composer.
- Authenticated direct request creation and continuation without visiting the target conversation.
- Redacted network capture with request body decoding and initiator stacks.
- Old-core versus guest versus authenticated migration reports.

## Manually authorize Chrome

```bash
npm run authorize -- 9226 ./manual-auth-profile
```

The launcher creates or reuses the profile, opens ChatGPT's normal login flow, and never reads credentials. Email, password, OAuth, MFA, and browser challenges remain entirely manual. The profile directory is gitignored.

## DOM mode: guest or authenticated

```bash
npm run natural -- 9226 "Your prompt"
```

`AwtsmoosGPTifyBrowser.go({ prompt, onstream, ondone })` inspects the page, selects the visible composer, submits normally, and reads the visible assistant turn. It supports both the logged-out guest textarea and the authenticated ProseMirror editor.

## Direct authenticated mode

Dry-run the current request structure without sending the intended prompt:

```bash
npm run direct:dry -- 9226 "Your prompt"
```

Create a real authenticated conversation and continue it directly:

```bash
npm run direct:chat -- 9226 \
	"First prompt" \
	"Continuation prompt"
```

Direct mode performs these stages:

1. It recycles ChatGPT controller tabs while preserving the Chrome profile session.
2. Before the fresh root page loads, it installs a small WebSocket constructor proxy.
3. The page creates and owns its normal authenticated topic socket.
4. The library retains only an object reference to that socket inside the page.
5. A harmless carrier turn lets the page generate a fresh authorized conversation envelope.
6. CDP intercepts and suppresses the carrier conversation request.
7. Only prompt text and conversation linkage are mutated in transient memory.
8. The real request is sent with same-origin `fetch` inside the authenticated page context.
9. The POST returns a stream handoff containing a conversation ID and topic ID.
10. The client subscribes on the page-owned socket and reduces v1 add, append, patch, and marker items.

The short-lived WebSocket verification URL, bearer token, cookies, account ID, session values, sentinel values, proof values, and conversation IDs are never written by the library.

## Important controller behavior

Direct mode closes existing ChatGPT tabs and creates a fresh authenticated root controller tab so its app-owned WebSocket can be retained before startup. It does not navigate that controller to the target direct conversation. Other unrelated Chrome tabs are left alone.

## Observed guest transport on July 23, 2026

- `POST /unauth-mweb/conversation/prepare`
- `POST /unauth-mweb/conversation/updates?operationId=...`
- URL-encoded form fields
- `text/vnd.openai.web-mobile-partial+html` answer stream
- page-managed sentinel preparation and finalization

## Observed authenticated transport on July 23, 2026

- `POST /backend-api/f/conversation/prepare`
- `POST /backend-api/sentinel/chat-requirements/prepare`
- `POST /backend-api/f/conversation`
- sentinel ping and finalization
- JSON body and richer client headers
- POST response containing `resume_conversation_token` and `stream_handoff`
- answer delivery over the page-owned `wss://ws.chatgpt.com/` topic bus
- v1 delta items ending with the `last_token` marker

## Generate reports

```bash
npm run matrix
npm run contract
npm run capture -- 9226 30
```

Key reports live under `evidence/reports/`, including:

- `AUTHENTICATED_REQUESTS_AND_STACKS.md`
- `old-guest-authenticated-matrix.json`
- `authenticated-contract-summary.json`
- `authenticated-dom-trace.json`
- `direct-authenticated-live.json`
- `final-authenticated-readback-audit.json`

## Verify

```bash
npm run check
npm test
```

## Boundary

These are private web implementation details and may change again. DOM mode is the most resilient default. Direct mode deliberately obtains fresh page-managed authorization for every turn rather than replaying stored credentials, proof values, challenge values, or expired WebSocket URLs. No bypass is implemented.
