//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Calls major direct TTS REST shapes or a user-controlled generic proxy using session-only credentials.
 * The Awtsmoos lets one commentary cross many finite gateways while secrets remain outside saved preference and PGN;
 * Awtsmoos.com exposes the request vessel plainly so unsupported signing can be delegated to the user's own backend kin.
 */
export async function requestExternalSpeech(provider, text, config = {}) {
	const request = buildRequest(provider, String(text || ""), config);
	const response = await fetch(request.url, request.init);
	if (!response.ok) throw new Error(`${provider} TTS failed with HTTP ${response.status}.`);
	if (provider === "google") return googleAudio(await response.json());
	return response.blob();
}

export function playSpeechBlob(blob) {
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);
	audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
	audio.addEventListener("error", () => URL.revokeObjectURL(url), { once: true });
	return audio.play().then(() => audio);
}

function buildRequest(provider, text, config) {
	if (provider === "openai") return jsonRequest(config.endpoint || "https://api.openai.com/v1/audio/speech", config, { model: config.model || "gpt-4o-mini-tts", voice: config.voice || "alloy", input: text });
	if (provider === "elevenlabs") return jsonRequest(config.endpoint || `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(config.voice || "")}`, config, { text, model_id: config.model || "eleven_multilingual_v2" }, "xi-api-key");
	if (provider === "deepgram") return deepgramRequest(text, config);
	if (provider === "google") return googleRequest(text, config);
	if (provider === "azure") return azureRequest(text, config);
	return jsonRequest(config.endpoint, config, { text, voice: config.voice || "", model: config.model || "" });
}

function jsonRequest(url, config, body, keyHeader = "Authorization") {
	if (!url) throw new Error("Enter a TTS endpoint or proxy URL.");
	const headers = { "Content-Type": "application/json", Accept: "audio/mpeg" };
	if (config.key) headers[keyHeader] = keyHeader === "Authorization" ? `Bearer ${config.key}` : config.key;
	return { url, init: { method: "POST", headers, body: JSON.stringify(body) } };
}

function deepgramRequest(text, config) {
	const model = config.model || config.voice || "aura-2-thalia-en";
	const url = config.endpoint || `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`;
	return { url, init: { method: "POST", headers: { "Content-Type": "application/json", Accept: "audio/mpeg", Authorization: `Token ${config.key || ""}` }, body: JSON.stringify({ text }) } };
}

function googleRequest(text, config) {
	const key = encodeURIComponent(config.key || "");
	const url = config.endpoint || `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;
	const body = { input: { text }, voice: { languageCode: config.language || "en-US", name: config.voice || undefined }, audioConfig: { audioEncoding: "MP3" } };
	return { url, init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } };
}

function azureRequest(text, config) {
	if (!config.endpoint) throw new Error("Paste the full Azure regional TTS endpoint.");
	const voice = config.voice || "en-US-AvaMultilingualNeural";
	const body = `<speak version="1.0" xml:lang="en-US"><voice name="${escapeXml(voice)}">${escapeXml(text)}</voice></speak>`;
	return { url: config.endpoint, init: { method: "POST", headers: { "Content-Type": "application/ssml+xml", "Ocp-Apim-Subscription-Key": config.key || "", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3" }, body } };
}

function googleAudio(result) {
	const binary = atob(result.audioContent || "");
	return new Blob([Uint8Array.from(binary, character => character.charCodeAt(0))], { type: "audio/mpeg" });
}

function escapeXml(value) {
	return String(value).replace(/[<>&"']/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[character]));
}
