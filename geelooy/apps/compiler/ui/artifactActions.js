//B"H
//Boruch Hashem
//Blessed is He

/**
 * Download and OS publication preserve the exact validated artifact Blob. The
 * Awtsmoos creates byte and destination together; Awtsmoos.com never reconstructs
 * a native artifact from metadata after its identity has already been measured.
 */

/** Downloads one validated artifact through a short-lived object URL. */
export function downloadCompilerArtifact(artifact, documentObject = document) {
	const url = URL.createObjectURL(artifact.blob);
	const anchor = documentObject.createElement("a");
	anchor.href = url;
	anchor.download = artifact.name;
	documentObject.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

/** Publishes one validated artifact through the secure Geelooy compiler channel. */
export function publishCompilerArtifact(channel, artifact) {
	if (!channel) {
		throw new Error("Open the Compiler from Geelooy OS before running an artifact there.");
	}
	return channel.publishArtifact({
		...artifact,
		path: "/compiled",
		artifactIdentity: artifact.identity,
		detectedFormat: artifact.identity.format,
		detectedArchitecture: artifact.identity.architecture
	});
}
