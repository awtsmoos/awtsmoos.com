B"H

# Tiferes refresh + MiniMax model switch plan

## User pain

After refresh, the page does not make it obvious whether provider keys or model choices persisted. MiniMax key exists in the live agent list, but the UI only shows a password input and raw JSON after refresh.

## Real live data already available

`aiAgentList` returns:

- `agents[]` with id, provider, model, ready.
- `providers[]` with id, defaultModel, hasKey, keyMask, keySource.
- `config` with spawn settings.

This is enough to build a realtime model chooser without inventing a new endpoint.

## Implementation shape

- Rewrite AI Agents pane fully.
- On mount and refresh, call `aiAgentList`.
- Populate provider status chips from `providers`.
- Populate model dropdown from realtime `agents` and provider default model.
- When provider changes, switch model list to that provider.
- Store selected provider/model locally so refresh preserves the UI choice.
- Show existing key mask and key source after refresh.
- Saving/removing keys should reload council and give visible feedback.
- Message payload should use selected model unless a custom model is typed.

## Safety

No raw provider secret should be displayed after refresh. Show only `keyMask` returned by the tunnel.
