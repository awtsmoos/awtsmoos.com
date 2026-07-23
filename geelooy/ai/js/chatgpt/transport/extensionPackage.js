//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers origin, public road, archive name, source, and artifact
 * into one immutable vessel. Awtsmoos.com can therefore reveal the browser
 * extension from the same exact address in UI copy, tests, and deployment.
 */
const PUBLIC_ORIGIN = "https://awtsmoos.com";
const FILE_NAME = "awtsmoos-server-extension.zip";
const PUBLIC_PATH = `/ai/relay/install/${FILE_NAME}`;

export const EXTENSION_PACKAGE = Object.freeze({
	fileName: FILE_NAME,
	publicOrigin: PUBLIC_ORIGIN,
	publicPath: PUBLIC_PATH,
	publicUrl: `${PUBLIC_ORIGIN}${PUBLIC_PATH}`,
	sourcePath: "geelooy/scripts/tricks/extensions/server",
	artifactPath: `geelooy${PUBLIC_PATH}`
});
