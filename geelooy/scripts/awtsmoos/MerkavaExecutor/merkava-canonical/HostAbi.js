//B"H
//Boruch Hashem
//Blessed be He

/**
 * Canonical host ABI families shared by browser and native Merkava runtimes.
 * Browser intelligence stays inside portable bytecode; these bindings expose
 * only platform primitives whose behavior can be tested independently.
 */
const HOST_ABI = Object.freeze({
	audio: Object.freeze([
		'createDevice',
		'closeDevice',
		'submitFrames'
	]),
	clipboard: Object.freeze([
		'readText',
		'writeText'
	]),
	crypto: Object.freeze([
		'randomBytes'
	]),
	fonts: Object.freeze([
		'loadFont',
		'measureGlyph',
		'rasterizeGlyph',
		'uploadGlyphAtlas'
	]),
	graphics: Object.freeze([
		'createSurface',
		'present',
		'resizeSurface',
		'getCapabilities'
	]),
	input: Object.freeze([
		'onPointer',
		'onKeyboard',
		'onTextComposition',
		'onWheel'
	]),
	network: Object.freeze([
		'fetch'
	]),
	storage: Object.freeze([
		'readFile',
		'writeFile',
		'stat',
		'listDir'
	]),
	threads: Object.freeze([
		'spawnWorker',
		'postMessage',
		'terminateWorker'
	]),
	timers: Object.freeze([
		'now',
		'setTimeout',
		'clearTimeout',
		'requestAnimationFrame'
	]),
	window: Object.freeze([
		'createWindow',
		'destroyWindow',
		'setTitle',
		'setCursor',
		'setFullscreen'
	])
});

/**
 * Flattens the versioned ABI into stable `family.member` capability names.
 * @returns {string[]} Sorted immutable host capability list.
 */
function hostCapabilityNames() {
	return Object.freeze(
		Object.entries(HOST_ABI)
			.flatMap(([family, members]) => members.map(member => `${family}.${member}`))
			.sort()
	);
}

module.exports = {
	HOST_ABI,
	hostCapabilityNames
};
