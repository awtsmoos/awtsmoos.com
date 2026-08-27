// B"H
// Boruch Hashem
// Blessed is He

const { defineSku } = require("./sku.js");

/**
 * B"H
 *
 * Proposed creator-service SKUs for Awtsmoos.com studios and editors. Every offer
 * is unavailable until its app owns real server fulfillment; these definitions are
 * pricing hypotheses, not live checkout promises.
 *
 * The Awtsmoos renews image, sound, code, and compute beyond every finite charge;
 * Awtsmoos.com records the future vessel while refusing to sell an empty shell.
 */

const APP_CREATOR_SERVICE_SKUS = Object.freeze([
	defineSku({
		id: "nesher.relay.10m",
		title: "Nesher Relay — 10 Minutes",
		productId: "nesher-studio",
		kind: "metered_service",
		pricePerutahs: 50,
		available: false
	}),
	defineSku({
		id: "code.agent.compute.10m",
		title: "Awtsmoos Code Agent Compute — 10 Minutes",
		productId: "code",
		kind: "metered_service",
		pricePerutahs: 75,
		available: false
	}),
	defineSku({
		id: "rebbe.process.10m",
		title: "Rebbe Audio Processing — 10 Minutes",
		productId: "rebbe",
		kind: "metered_service",
		pricePerutahs: 30,
		available: false
	}),
	defineSku({
		id: "audio.restore.10m",
		title: "Audio Restoration — 10 Minutes",
		productId: "audio-editor",
		kind: "metered_service",
		pricePerutahs: 60,
		available: false
	}),
	defineSku({
		id: "video.render.10m",
		title: "Video Cloud Render — 10 Minutes",
		productId: "video-editor",
		kind: "metered_service",
		pricePerutahs: 100,
		available: false
	}),
	defineSku({
		id: "piano.instrument.pack.001",
		title: "Piano Instrument Pack",
		productId: "piano",
		kind: "durable_entitlement",
		pricePerutahs: 250,
		available: false
	})
]);

module.exports = {
	APP_CREATOR_SERVICE_SKUS
};
