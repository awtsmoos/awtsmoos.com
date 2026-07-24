B"H
Boruch Hashem
Blessed is He

# Authenticated Requests, Stack Traces, and Old-Core Migration Portrait

The Awtsmoos recreates the browser, request, stream, and answer every instant. This report records what was directly observed on July 23, 2026 through a manually authenticated ChatGPT Chrome profile. It records no Bearer [REDACTED], cookie, account identifier, session value, proof value, challenge value, conversation identifier, message identifier, WebSocket user path, or WebSocket verification query.

## Verified session state

- Debug port: `9226`.
- `/api/auth/session` returned HTTP 200.
- A user object and access token were present in browser memory.
- No `Log in` control was visible.
- The authenticated ProseMirror composer was visible at `div#prompt-textarea[contenteditable="true"]`.
- The Chrome profile remained manually authorized between browser restarts.

## Old uploaded core

| Concern | Old source range | Old behavior |
| --- | ---: | --- |
| Session retrieval | 426–436 | `GET /api/auth/session` and return `accessToken` |
| Request body and headers | 106–149 | JSON body with `action`, `messages`, `parent_message_id`, `model`; old sentinel headers |
| Conversation request | 151–159 | `POST /backend-api/conversation` |
| Stream parser | 237–315 | Split `data:` lines, parse JSON, stop at `[DONE]` |
| Conversation list | 320–332 | `GET /backend-api/conversations` |
| Synthesis | 334–368 | `GET /backend-api/synthesize` |
| Conversation detail | 383–397 | `GET /backend-api/conversation/{id}` |
| Sentinel helpers | 402–463 | Old requirements route and embedded proof generation |

### Security defects in the old core

- Line 70 prints the Bearer [REDACTED] to the console.
- Line 156 prints the full request options object.
- Proof-generation and browser-fingerprint logic are embedded directly in the client.
- Session, account, device, build, route, observation, and topic-stream concerns are mixed into one monolithic file.

## Guest request portrait

A normal logged-out guest turn used:

1. `POST /unauth-mweb/sentinel/chat-requirements/prepare`
2. `POST /unauth-mweb/conversation/prepare`
3. `POST /unauth-mweb/conversation/updates?operationId=...`
4. sentinel finalization and ping requests

The conversation body was URL-encoded form data. The answer response used `text/vnd.openai.web-mobile-partial+html`. The visible guest page managed requirement, proof, and challenge values.

## Authenticated request portrait

A normal authenticated DOM turn used this relevant sequence:

1. `POST /backend-api/f/conversation/prepare`
2. `POST /backend-api/sentinel/chat-requirements/prepare`
3. `POST /backend-api/f/conversation`
4. `POST /backend-api/sentinel/ping`
5. `POST /backend-api/sentinel/chat-requirements/finalize`
6. low-level sentinel request work where required

### Main authenticated conversation request

- Method: `POST`.
- Route: `/backend-api/f/conversation`.
- Content type: `application/json`.
- POST response content type: `text/event-stream; charset=utf-8`.
- Retained old fields: `action`, `messages`, `parent_message_id`, `model`.
- Observed model value: `gpt-5-6-thinking`.
- Observed supported encoding: `v1`.

Additional body fields observed:

- `client_prepare_state`
- `timezone_offset_min`
- `timezone`
- `conversation_mode`
- `enable_message_followups`
- `system_hints`
- `supports_buffering`
- `supported_encodings`
- `client_contextual_info`
- `paragen_cot_summary_display_override`
- `force_parallel_switch`
- `thinking_effort`
- `local_function_names`

Additional current header families observed:

- account and device identity headers
- client build and locale headers
- route and deployment headers
- turn-trace and observation headers
- `OpenAI-Sentinel-Chat-Requirements-Prepare-Token`
- `OpenAI-Sentinel-Proof-Token`
- `OpenAI-Sentinel-Turnstile-Token`

All values in those sensitive families remain redacted.

## Initiator stack traces

Chrome reported the main application request through:

```text
function: o
bundle: https://chatgpt.com/cdn/assets/2340486e-ochsjnnr5ckjjz3o.js
zero-based line: 25
zero-based column: 3286
human display: line 26, column 3287
```

Chrome reported sentinel proof work through:

```text
function: Ce
bundle: https://chatgpt.com/sentinel/20260423af3c/sdk.js
zero-based line: 0
zero-based column: 27053
human display: line 1, column 27054
```

The full recursive initiator objects and frame coordinates are retained in `authenticated-dom-trace.json` and `authenticated-contract-summary.json`, with sensitive values removed.

## Authenticated answer handoff

The current authenticated POST does not necessarily contain the assistant answer itself. Its SSE response contained:

1. `resume_conversation_token`
2. `stream_handoff`
3. `[DONE]`

The selected handoff option was `subscribe_ws_topic`, containing a transient conversation ID and topic ID.

## Page-owned topic transport

The normal application opens an authenticated WebSocket under `wss://ws.chatgpt.com/`. The URL contains a short-lived user path and verification query; neither is persisted.

The app sends a subscription command shaped as:

```json
[
	{
		"id": 1,
		"command": {
			"type": "subscribe",
			"topic_id": "<transient>",
			"offset": "0"
		}
	}
]
```

Observed frame families included:

- `reply`
- `subscribe`
- `message`
- `conversation-turn-stream`
- `stream-item`

Nested `encoded_item` values contained SSE-formatted events:

- `delta_encoding` with `v1`
- `input_message`
- `delta`
- `title_generation`
- `message_marker`

Observed v1 operations included `add`, `append`, and `patch`. The final answer text arrived as a patch append to `/message/content/parts/0`. The authoritative continuation message ID arrived on the terminal `message_marker` with marker `last_token`.

## New direct-request system

The direct authenticated client performs these stages:

1. Close only existing ChatGPT controller tabs; leave unrelated tabs untouched.
2. Open a fresh root ChatGPT tab using the persisted authorized profile.
3. Install a WebSocket constructor proxy before application code loads.
4. Let the application create and own its normal authenticated socket.
5. Retain only the socket object reference inside the page runtime.
6. Trigger a harmless carrier turn so the page creates a fresh authorized request envelope.
7. Intercept and suppress the carrier conversation POST with CDP Fetch.
8. Mutate only the prompt and explicit continuation linkage in transient Node memory.
9. Send the real JSON request with same-origin `fetch` inside the authenticated page.
10. Parse the POST's stream handoff.
11. Subscribe to the topic using the page-owned socket.
12. Reduce v1 stream operations into final answer, conversation ID, and assistant message ID.
13. Close the controller tab without navigating to the direct conversation.

## Live direct proof

The published `npm run direct:chat` command completed successfully.

### Creation turn

- Exact answer: `BH direct authenticated creation verified.`
- HTTP status: 200.
- POST content type: `text/event-stream; charset=utf-8`.
- Topic frames: 18.
- Encoded stream items: 21.
- Terminal marker observed: yes.
- Conversation and assistant continuation identifiers obtained: yes.

### Continuation turn

- Exact answer: `BH direct authenticated continuation verified.`
- HTTP status: 200.
- Topic frames: 11.
- Encoded stream items: 14.
- Terminal marker observed: yes.
- Same conversation identifier as creation turn: yes.

### Navigation assertion

The controller page never navigated to the target direct conversation for either turn. The carrier preparation may create a separate controller-side route, but the returned direct conversation identifier was explicitly compared against the page URL and was absent.

## Recommended public behavior

- Guest users: use DOM mode.
- Authenticated users seeking maximum resilience: use DOM mode.
- Authenticated users needing direct creation and continuation without target-thread navigation: use direct mode.
- Never cache or replay Bearer [REDACTED], cookies, proof values, challenge values, account identifiers, or WebSocket verification URLs.
- Treat all documented private routes and fields as dated observations that must be recaptured when ChatGPT changes again.
