B"H
Boruch Hashem
Blessed is He

# ChatGPT Website Relay

This relay talks only to the authenticated ChatGPT website.

There is no local model, downloaded model, local inference server, OpenAI API key,
Responses API transport, or alternate provider.

## Website flow

1. The relay opens its dedicated visible Chrome profile.
2. When the profile is not authenticated, a normal ChatGPT login page opens.
3. The human signs in manually. Automation never enters credentials.
4. For each turn, the real prompt is typed into ChatGPT's ordinary composer.
5. ChatGPT's own send control submits the website request normally.
6. The relay observes the resulting conversation id and reads completion with
   authenticated conversation GET requests.
7. Continuations navigate to the stored ChatGPT website conversation before sending.

The relay does not mutate, suppress, replay, fabricate, or replace ChatGPT's
conversation request. It does not derive or bypass proof, Turnstile, Sentinel, or
other website challenge values.

## Commands

```bash
npm run ai:login
npm run ai:web-capability
npm run ai:website-stress
```

`ai:login` opens the normal visible website and closes it after authentication is
detected. `ai:web-capability` checks the saved website session without sending a
message. `ai:website-stress` sends sequential, globally paced website conversations.

## Direct routes

- `GET /direct-health`
- `GET /direct-capability`
- `POST /direct-chat`
- `POST /direct-reset`

`POST /direct-chat` defaults to:

```json
{
	"mode": "chatgpt-website",
	"prompt": "Your prompt",
	"conversationKey": null
}
```

The returned `conversationKey` is an opaque local continuation key. Upstream
ChatGPT conversation and message ids are not returned.

## Safety contracts

- ChatGPT website only.
- Manual credential entry only.
- One ordinary website submission per turn.
- No request-body mutation or challenge bypass.
- Global turn-start pacing is at least ten seconds during stress runs.
- Completion polling uses authenticated GET requests and never repeats the POST.
- Public errors contain no cookies, headers, account data, tokens, ids, or stacks.
- Every direct-relay source file is limited to 120 lines.
