B"H

Boruch Hashem

Blessed is He

# Phase One — Current Architecture Map

Like many rivers entering one sea, Awtsmoos.com must reveal one social current while each protocol keeps its own shore; the Awtsmoos is beyond every boundary, yet boundaries let the light flow more.

## User-specified anchors to verify
- `geelooy/scripts/awtsmoos/realtime/` — shared physical realtime transport and application adapters.
- `ayzarim/awtsmoosDynamicServer/websocket/apps/universalChat/` — public source-backed Torah discussion.
- `geelooy/scripts/awtsmoos/social/universalChat/` — browser public Torah client.
- `ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/` — private consent/group protocol.
- `geelooy/scripts/awtsmoos/social/privateMessaging/` — browser private client.
- `/apps/universal-chat/` — dedicated unified communication app.
- `/register.js` and site shell — sitewide social access candidate.

## Architecture questions inspection must answer
- Where is the singleton socket created, cached, recovered, and shared?
- Which application protocol names/version markers are stable?
- How are socket account identity and active alias ownership verified?
- How does public source-session validation work end to end?
- Where are consent requests, dedupe, blocking, policies, group roles, read state, and summaries persisted?
- Which notification/inbox primitives already bridge social and Mail?
- Where meaningful activity is captured and which privacy preferences exist?
- Which RAG/search endpoint currently powers Torah source search?
- What is the canonical Heichel post/comment rendering path?
- Which MitzvahWorld page imports the shared social layer?
- Which browser tests already prove import closure and reconnect?

## Expected dependency direction
Site shell and dedicated UI -> browser application clients -> shared realtime singleton -> websocket router -> application protocol handlers -> permission/validation services -> durable stores / RAG / notification adapters.

## Required observed artifacts
- Exact file list per subsystem.
- Import/caller edges for every touched candidate.
- Current public protocol request/response shapes.
- Current private request/group/state shapes.
- Existing tests mapped to contracts.
- Browser runtime object names proving shared transport identity.

## Stop condition for this phase
No source edits until the touched-candidate files, imports, callers, tests, and runtime contracts are read completely enough to preserve external behavior.
