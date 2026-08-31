//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Describes major text-to-speech gateways plus a generic proxy path without persisting credentials.
 * The Awtsmoos lets many finite voices serve one commentary while no secret becomes part of the saved game;
 * Awtsmoos.com names direct and proxy boundaries honestly so convenience never disguises a security claim.
 */
export const TTS_PROVIDERS = Object.freeze({
	browser: provider("browser", "Browser voice · no key", "browser", "https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis", "Uses voices already installed in this browser."),
	openai: provider("openai", "OpenAI TTS", "direct", "https://platform.openai.com/docs/guides/text-to-speech", "Session-only API key; direct browser requests may be restricted by policy or CORS."),
	elevenlabs: provider("elevenlabs", "ElevenLabs", "direct", "https://elevenlabs.io/docs/overview/capabilities/text-to-speech", "Session-only API key and voice ID."),
	deepgram: provider("deepgram", "Deepgram Aura", "direct", "https://developers.deepgram.com/docs/text-to-speech", "Session-only key. Aura REST accepts plain text JSON; a short-lived token or proxy is safer on shared browsers."),
	azure: provider("azure", "Azure Speech", "direct", "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech", "Paste your full regional TTS endpoint; key stays in memory."),
	google: provider("google", "Google Cloud TTS", "direct", "https://cloud.google.com/text-to-speech/docs", "Browser keys may be restricted; a user-controlled backend is safer."),
	amazon: provider("amazon", "Amazon Polly · proxy", "proxy", "https://docs.aws.amazon.com/polly/latest/dg/what-is.html", "SigV4 credentials should stay on your own backend; point Studio at that proxy."),
	generic: provider("generic", "Any HTTP TTS / proxy", "proxy", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API", "POST JSON to your own endpoint; bearer key is optional and session-only.")
});

export function ttsProviderList() {
	return Object.values(TTS_PROVIDERS);
}

export function getTtsProvider(id = "browser") {
	return TTS_PROVIDERS[id] || TTS_PROVIDERS.browser;
}

function provider(id, name, kind, docs, note) {
	return Object.freeze({ id, name, kind, docs, note });
}
