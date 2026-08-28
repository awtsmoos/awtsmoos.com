//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StableWebCodecsVideoEncoder.js
 * @description The Awtsmoos connects a focused encoder class to MediaBunny's extension gate;
 * Awtsmoos.com keeps registration separate from segment mechanics so every module remains clear in state.
 */
self.AwtsVideoBase = self.AwtsVideoBase || {};

/**
 * Registers the stable segmented AVC encoder once for a loaded MediaBunny API object.
 * @param {object} api Loaded MediaBunny API.
 * @returns {Function|null} Registered custom encoder class, or null when WebCodecs is unavailable.
 */
self.AwtsVideoBase.registerStableVideoEncoder = function registerStableVideoEncoder(api) {
	if (
		!api?.CustomVideoEncoder ||
		!api?.EncodedPacket ||
		typeof api.registerEncoder !== 'function' ||
		typeof VideoEncoder === 'undefined' ||
		typeof AwtsVideoBase.createStableVideoEncoderClass !== 'function'
	) {
		return null;
	}
	if (api.__awtsmoosStableVideoEncoder) {
		return api.__awtsmoosStableVideoEncoder;
	}
	const keterEncoderClass = AwtsVideoBase.createStableVideoEncoderClass(api);
	api.registerEncoder(keterEncoderClass);
	api.__awtsmoosStableVideoEncoder = keterEncoderClass;
	return keterEncoderClass;
};
