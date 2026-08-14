// B"H

const Dependencies = require("./deps.js");
const SourceProbe = require("./httpProbe.js");
const PublicProbe = require("./publicProbe.js");
const Registry = require("../previewRegistry.js");

/**
 * @file Creates one durable local-server preview registration.
 * @description
 * The Awtsmoos distinguishes the local flame, its public doorway, and the witness
 * who actually crossed that doorway. A preview is recorded before public probing so
 * reconnects and launcher renewal cannot erase its ownership testimony.
 */
async function expose(payload = {}) {
	const detected = explicit(payload) ? [] : await Dependencies.Detect.detect(payload);
	const selected = explicit(payload) || choose(payload, detected);
	const sourceUrl = source(payload, selected);
	const allowed = Boolean(sourceUrl) && Dependencies.Policy.localServerAllowed(payload);
	const sourceProbe = allowed
		? await SourceProbe.request(sourceUrl, payload.previewProbeTimeoutMs)
		: { ok: false, error: "local_server_preview_not_allowed" };
	const preview = Dependencies.Policy.apply(
		Dependencies.Payload.createPayload(payload, "proxy", {
			url: sourceUrl,
			port: selected?.port || payload.port || null,
			path: payload.proxyPath || "/",
			detectedServers: detected
		}),
		payload
	);
	const publicUrl = sourceUrl ? Dependencies.Url.proxyUrl(payload, sourceUrl) : "";
	const registration = sourceProbe.ok
		? Registry.create({
			...preview,
			sourceUrl,
			publicUrl,
			stateRoot: payload.recoveryRoot,
			sourceVerifiedAt: new Date().toISOString()
		})
		: null;
	const publicProbe = await verifyPublic(payload, publicUrl, sourceProbe);
	return result(payload, preview, detected, selected, sourceProbe, publicProbe, registration, publicUrl);
}

async function verifyPublic(payload, publicUrl, sourceProbe) {
	if (!sourceProbe.ok || !publicUrl || payload.verifyPublic === false) {
		return { ok: false, verified: false, error: "public_preview_not_verified" };
	}
	return PublicProbe.verify(publicUrl, {
		timeoutMs: payload.publicProbeTimeoutMs,
		headers: payload.publicProbeHeaders || {},
		expectedMarker: payload.expectedPublicMarker || "",
		expectedSha256: payload.expectedPublicSha256 || ""
	});
}

function result(payload, preview, detected, selected, sourceProbe, publicProbe, registration, publicUrl) {
	const ok = Boolean(registration && sourceProbe.ok);
	return {
		ok,
		action: "previewExposeLocalServer",
		preview,
		previewId: registration?.id || "",
		detectedServers: detected,
		selectedServer: selected,
		sourceUrl: registration?.sourceUrl || "",
		sourceProbe,
		publicUrl,
		proxyUrl: publicUrl,
		publicProbe,
		publicVerified: publicProbe.verified === true,
		verificationRequired: publicProbe.verified !== true,
		agentGuidance: {
			purpose: "preview-local-server",
			plainEnglish: Dependencies.Guidance.text(selected, detected),
			canSteer: true
		},
		nextSuggestedAction: Dependencies.Guidance.payload(selected)
	};
}

function explicit(payload) {
	if (payload.url) return {
		url: payload.url,
		port: payload.port || Number((String(payload.url).match(/:(\d+)/) || [])[1]) || null,
		manual: true
	};
	if (payload.port) return {
		url: `http://127.0.0.1:${payload.port}${payload.proxyPath || "/"}`,
		port: payload.port,
		manual: true
	};
	return null;
}

function choose(payload, detected) {
	if (payload.port) return detected.find(server => Number(server.port) === Number(payload.port)) || null;
	return detected[0] || null;
}

function source(payload, selected) {
	return payload.url || selected?.url || "";
}

module.exports = {
	expose,
	explicit
};
