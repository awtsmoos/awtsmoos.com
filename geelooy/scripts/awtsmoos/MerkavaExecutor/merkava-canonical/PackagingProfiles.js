//B"H
//Boruch Hashem
//Blessed be He

/**
 * Immutable distribution contracts for every public Merkava platform target.
 * These records describe what a production package must contain; availability
 * is established separately by the toolchain doctor and conformance gates.
 */
const PACKAGING_PROFILES = Object.freeze({
	android: packageProfile({
		artifact: "apk",
		graphics: ["vulkan", "gles3"],
		host: "android-nativeactivity",
		id: "android",
		signing: "android-apk-signature-v2+"
	}),
	browser: packageProfile({
		artifact: "web",
		graphics: ["webgl2", "webgl1"],
		host: "browser-js-wasm",
		id: "browser",
		signing: "https-origin"
	}),
	linux: packageProfile({
		artifact: "elf-appimage",
		graphics: ["vulkan", "opengl"],
		host: "wayland-x11",
		id: "linux",
		signing: "optional-distribution-signature"
	}),
	macos: packageProfile({
		artifact: "app",
		graphics: ["metal"],
		host: "cocoa",
		id: "macos",
		signing: "codesign+notarization"
	}),
	windows: packageProfile({
		artifact: "exe",
		graphics: ["vulkan", "d3d12", "opengl"],
		host: "win32",
		id: "windows",
		signing: "authenticode"
	})
});

/** @param {object} input Distribution fields. @returns {object} Frozen profile. */
function packageProfile(input) {
	return Object.freeze({
		...input,
		graphics: Object.freeze(input.graphics)
	});
}

/** Resolves one distribution contract and rejects unknown target identities. */
function packagingProfile(id) {
	const profile = PACKAGING_PROFILES[String(id || "").toLowerCase()];
	if (!profile) {
		throw new Error(`merkava_packaging_target_unknown:${id}`);
	}
	return profile;
}

module.exports = {
	PACKAGING_PROFILES,
	packagingProfile
};
