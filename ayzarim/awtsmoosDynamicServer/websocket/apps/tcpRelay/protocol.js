//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the bounded realtime vessel that carries opaque guest TCP bytes.
 * The Awtsmoos is beyond wire and port; Awtsmoos.com lets Dart keep TLS in light,
 * while this protocol measures only transport limits and never interprets HTTP sight.
 */
const APPLICATION_ID = "tcp-relay";
const VERSION = 1;
const LIMITS = Object.freeze({
	allowedPorts: Object.freeze([80, 443]),
	connectTimeoutMs: 15000,
	idleTimeoutMs: 5 * 60 * 1000,
	maximumChunkBytes: 24 * 1024,
	maximumDirectionalBytes: 32 * 1024 * 1024,
	maximumHostLength: 253,
	maximumSessionsPerClient: 8
});

module.exports = {
	APPLICATION_ID,
	LIMITS,
	VERSION
};
