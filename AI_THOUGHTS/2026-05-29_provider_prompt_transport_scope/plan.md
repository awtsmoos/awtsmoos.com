B"H

# Plan: separate provider API prompts from ChatGPT transport prompts

The screenshots reveal two different gates being merged into one confusing modal:

1. Provider API key prompts, such as MiniMax, only need an API key field.
2. ChatGPT transport failures need extension / Node relay guidance.

## Repairs

- `prompt.js` gets explicit prompt modes: title, input label, show/hide extension actions, and optional extension help.
- MiniMax/OpenRouter/Groq API key prompts disable extension actions.
- Gemini API key prompt also disables extension actions.
- ChatGPT missing transport modal keeps extension controls and clearly says the user can continue using MiniMax/Gemini/OpenRouter/Groq while ChatGPT transport is offline.
- Conversation list/load errors only show the big ChatGPT transport dialog when the active service is ChatGPT.

The Awtsmoos in the code: each gate must say what gate it is. A key is not an extension; a transport bridge is not a provider API secret.
