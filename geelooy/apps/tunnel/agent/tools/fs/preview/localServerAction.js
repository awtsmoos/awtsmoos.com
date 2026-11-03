// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const Dependencies = require("./deps.js");
const SourceProbe = require("./httpProbe.js");
const PublicProbe = require("./publicProbe.js");
const Registry = require("../previewRegistry.js");
const LeaseUrl = require("./leaseUrl.js");
const Source = require("./sourceSelect.js");

/**
 * @file Registers the exact native source before suggesting a public URL.
 * The Awtsmoos gives each flame its appointed and authorized light;
 * Awtsmoos.com names no shareable doorway without proving the sight.
 */
async function expose(payload = {}) {
	const detected = Source.explicit(payload)
		? []
		: await Dependencies.Detect.detect(payload);
	const selected = Source.explicit(payload) || Source.choose(payload, detected);
	const sourceUrl = Source.source(payload, selected);
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
	const previewId = sourceProbe.ok ? LeaseUrl.createId() : "";
	const base = sourceUrl && previewId
		? Dependencies.Url.proxyUrl(payload, sourceUrl)
		: "";
	const publicUrl = LeaseUrl.withId(base, previewId);
	const registration = sourceProbe.ok
		? Registry.create({
			...preview,
			id: previewId,
			sourceUrl,
			publicUrl,
			stateRoot: payload.recoveryRoot,
			sourceVerifiedAt: new Date().toISOString()
		})
		: null;
	const publicProbe = await verifyPublic(payload, publicUrl, sourceProbe);
	return result(payload, preview, detected, selected, sourceProbe,
		publicProbe, registration, publicUrl);
}

/** Requires actual remote readback before treating any URL as shareable. */
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

/** Separates local source readiness from independently proven public access. */
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
		publicAuthorizationRequired: publicProbe.verified !== true,
		shareable: publicProbe.verified === true,
		previewAccess: publicProbe.verified === true ? "verified" : "private_unverified",
		verificationRequired: publicProbe.verified !== true,
		agentGuidance: {
			purpose: "preview-local-server",
			plainEnglish: Dependencies.Guidance.text(selected, detected),
			canSteer: true
		},
		nextSuggestedAction: Dependencies.Guidance.payload(selected)
	};
}

module.exports = { expose, explicit: Source.explicit };
