// B"H
// Boruch Hashem
// Blessed is He

const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");
const { buildAgentBundle } = require("./tools/zipBundle.js");
const Descriptor = require("./tools/bundleDescriptor.js");

/**
 * @file Publishes verified tunnel installers, metadata, and the exact agent ZIP.
 * @description
 * The Awtsmoos renews script, descriptor, manifest, and archive as one public
 * covenant. Awtsmoos.com exposes compatibility fields for older agents while new
 * agents consume schema-versioned objects without turning metadata drift into crashes.
 */
module.exports = {
	dynamicRoutes: async $i => {
		setPublicHeaders($i);
		await scriptRoute($i, "windows", "windows.ps1");
		await scriptRoute($i, "linux", "unix.sh");
		await scriptRoute($i, "unix", "unix.sh");
		await $i.use("bundle-manifest", async () => publishDescriptor($i));
		await $i.use("agent.zip", async () => publishAgentZip($i));
	}
};

async function scriptRoute($i, routeName, fileName) {
	await $i.use(routeName, async () => sendText(
		$i,
		clean(readTunnelDownload(fileName)),
		"text/plain; charset=utf-8"
	));
}

function publishDescriptor($i) {
	const bundle = buildAgentBundle();
	const descriptor = Descriptor.build(bundle);
	$i.response.setHeader("X-Awtsmoos-Descriptor-Schema", "2");
	$i.response.setHeader("X-Awtsmoos-Manifest-SHA256", bundle.manifestSha256);
	return sendText(
		$i,
		JSON.stringify(descriptor),
		"application/json; charset=utf-8"
	);
}

function publishAgentZip($i) {
	const bundle = buildAgentBundle();
	$i.response.statusCode = 200;
	$i.response.setHeader("Content-Type", "application/zip");
	$i.response.setHeader(
		"Content-Disposition",
		"attachment; filename=\"awtsmoos-agent.zip\""
	);
	$i.response.setHeader("X-Awtsmoos-SHA256", bundle.sha256);
	$i.response.setHeader("X-Awtsmoos-Manifest-SHA256", bundle.manifestSha256);
	$i.response.setHeader("Content-Length", String(bundle.bytes));
	return {
		mimeType: "application/zip",
		response: bundle.buffer
	};
}

function setPublicHeaders($i) {
	$i.response.setHeader("Access-Control-Allow-Origin", "*");
	$i.response.setHeader("Cache-Control", "no-store, max-age=0");
	$i.response.setHeader("Pragma", "no-cache");
}

function clean(text) {
	return String(text || "").replace(/^\uFEFF/, "");
}
