//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares narration gateways without pretending a cloud secret belongs in a public browser.
 * The Awtsmoos gives one human sentence many finite voices while no vendor becomes the source of the word;
 * Awtsmoos.com keeps device speech keyless and sends every secret-bearing cloud service through a backend vessel.
 */
export const TTS_PROVIDERS = Object.freeze({
	browser: provider(
		"browser",
		"Browser voice · no key",
		"browser",
		"https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis",
		"Uses SpeechSynthesis voices already exposed by this browser or device."
	),
	openai: cloud("openai", "OpenAI speech", "https://platform.openai.com/docs/guides/text-to-speech"),
	elevenlabs: cloud("elevenlabs", "ElevenLabs", "https://elevenlabs.io/docs/overview/capabilities/text-to-speech"),
	deepgram: cloud("deepgram", "Deepgram Aura", "https://developers.deepgram.com/docs/text-to-speech"),
	hume: cloud("hume", "Hume Octave", "https://dev.hume.ai/docs/text-to-speech-tts/overview"),
	cartesia: cloud("cartesia", "Cartesia", "https://docs.cartesia.ai/api-reference/tts/bytes"),
	murf: cloud("murf", "Murf", "https://murf.ai/api/docs/text-to-speech/overview"),
	playht: cloud("playht", "PlayHT", "https://docs.play.ht/reference/api-getting-started"),
	resemble: cloud("resemble", "Resemble AI", "https://docs.resemble.ai/api-reference/text-to-speech/synthesize"),
	azure: cloud("azure", "Azure Speech", "https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech"),
	google: cloud("google", "Google Cloud TTS", "https://cloud.google.com/text-to-speech/docs"),
	amazon: cloud("amazon", "Amazon Polly", "https://docs.aws.amazon.com/polly/latest/APIReference/API_SynthesizeSpeech.html"),
	generic: provider(
		"generic",
		"Any HTTP TTS / your proxy",
		"proxy",
		"https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
		"Connect an HTTPS endpoint you control. Optional proxy authentication stays only in this Studio session."
	)
});

/** Returns providers in stable UI order. */
export function ttsProviderList() {
	return Object.values(TTS_PROVIDERS);
}

/** Resolves an unknown provider safely to browser-native speech. */
export function getTtsProvider(id = "browser") {
	return TTS_PROVIDERS[id] || TTS_PROVIDERS.browser;
}

/** Produces the security capability label shown before configuration. */
export function ttsCapability(provider) {
	return provider.kind === "browser"
		? "NO KEY · DEVICE VOICE"
		: "BACKEND / HTTPS PROXY REQUIRED";
}

function cloud(id, name, docs) {
	return provider(id, `${name} · backend`, "proxy", docs, `${name} credentials stay on your backend. Studio calls only an HTTPS speech endpoint you control.`);
}

function provider(id, name, kind, docs, note) {
	return Object.freeze({ id, name, kind, docs, note });
}
