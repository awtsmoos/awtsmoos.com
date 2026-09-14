//B"H
//Boruch Hashem
//Blessed be He

/**
 * Portable Merkava runtime target profiles.
 * These are required architecture contracts, not claims that every backend is
 * already complete; conformance tooling may report each implementation honestly.
 */
const TARGET_PROFILES = Object.freeze({
	android: profile('android', ['arm64'], ['vulkan', 'gles3'], 'apk'),
	browser: profile('browser', ['wasm32', 'js'], ['webgl2', 'webgl1'], 'web'),
	linux: profile('linux', ['x64', 'arm64'], ['vulkan', 'opengl'], 'elf'),
	macos: profile('macos', ['arm64', 'x64'], ['metal'], 'app'),
	windows: profile('windows', ['x64', 'arm64'], ['vulkan', 'd3d12', 'opengl'], 'exe')
});

/**
 * Creates one immutable target declaration used by compiler and runtime tests.
 * @param {string} id Stable target id.
 * @param {string[]} architectures Supported architecture identities.
 * @param {string[]} graphics Preferred graphics backend order.
 * @param {string} packageKind Produced application garment.
 * @returns {object} Immutable target profile.
 */
function profile(id, architectures, graphics, packageKind) {
	return Object.freeze({
		architectures: Object.freeze(architectures),
		graphics: Object.freeze(graphics),
		id,
		packageKind
	});
}

/**
 * Resolves a target profile or fails closed on unsupported target names.
 * @param {string} id Target id.
 * @returns {object} Immutable target profile.
 */
function targetProfile(id) {
	const target = TARGET_PROFILES[id];
	if (!target) {
		throw new Error(`merkava_target_unknown:${id}`);
	}
	return target;
}

module.exports = {
	TARGET_PROFILES,
	targetProfile
};
