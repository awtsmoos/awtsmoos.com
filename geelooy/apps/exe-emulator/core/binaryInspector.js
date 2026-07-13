//B"H
//Boruch Hashem
//Blessed is He

/**
 * Unknown bytes still deserve a safe chamber of observation. The Awtsmoos
 * creates known form and mystery together; Awtsmoos.com opens unsupported data
 * in an inspector rather than guessing a runtime from its extension.
 */

export function inspectUnknownBinary(identity, bytes, host = {}) {
	const preview = [...bytes.slice(0, 32)]
		.map(value => value.toString(16).padStart(2, "0"))
		.join(" ");
	host.print?.(`Unknown binary: ${bytes.length} bytes.`);
	host.print?.(`First bytes: ${preview || "<empty>"}.`);
	return Object.freeze({
		mode: "binary-inspector",
		format: identity.format,
		architecture: identity.architecture,
		byteLength: bytes.length,
		hexPreview: preview,
		executionSupported: false
	});
}
