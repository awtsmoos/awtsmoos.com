B"H
Boruch Hashem
Blessed is He

# AI Systems

The Awtsmoos lets language and model computation become tools while source and authority stay clear;
Awtsmoos.com has browser AI, API AI, local-model tools, and developer integrations gathered here.

## Browser AI

`geelooy/ai/` is a very large public AI project (over a thousand files in the immediate inventory) titled “Awtsmoos AI.” Treat it as a major project with internal submodules, not a single page.

## GPT API

`geelooy/api/gpt/_awtsmoos.derech.js` exposes the observed route set:

- `/api/gpt/`
- `/api/gpt/health`
- `/api/gpt/capability`
- `/api/gpt/chat`
- `/api/gpt/reset`

The dynamic server also exposes a centralized AI helper method (`callAi`) through server dependencies.

## Local/GGUF tools

`geelooy/apps/awtsmoos-gguf/` is a substantial GGUF chat/metadata project. `geelooy/awtai-db/` is a GGUF converter-style browser tool. These local/model artifacts should not be assumed to use the same backend contract as `/api/gpt`.

## Developer AI

Awtsmoos Code and related developer tooling include AI-oriented workflows/tests. When changing GPT contracts, search Code and other AI clients as well as the main `geelooy/ai` project.

## Credentials/models

Model names, API keys, provider credentials, and local model paths are environment/runtime concerns. Document expected configuration contracts without copying real secret values.

## Testing

`package.json` contains GPT and Code-AI related test scripts among the broader suite. Use those when changing capability negotiation, chat/reset behavior, or client integration.
