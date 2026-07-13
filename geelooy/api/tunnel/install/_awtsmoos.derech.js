// B"H
const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");
const { buildAgentBundle } = require("./tools/zipBundle.js");

function clean(text) {
	return String(text || "").replace(/^\uFEFF/, "");
}

/**
 * B"H — The public gate publishes the artifact hash before any installer trusts
 * it. Manifest count, version, bytes, and SHA-256 all describe one exact ZIP.
 */
module.exports = {
	dynamicRoutes: async $i => {
		$i.response.setHeader("Access-Control-Allow-Origin", "*");
		$i.response.setHeader("Cache-Control", "no-store");

		await $i.use("windows", async () => sendText(
			$i,
			clean(readTunnelDownload("windows.ps1")),
			"text/plain; charset=utf-8"
		));
		await $i.use("linux", async () => sendText(
			$i,
			clean(readTunnelDownload("unix.sh")),
			"text/plain; charset=utf-8"
		));
		await $i.use("unix", async () => sendText(
			$i,
			clean(readTunnelDownload("unix.sh")),
			"text/plain; charset=utf-8"
		));
		await $i.use("bundle-manifest", async () => {
			const bundle = buildAgentBundle();
			return sendText($i, JSON.stringify({
				ok: true,
				version: bundle.version,
				files: bundle.files,
				manifestSha256: bundle.manifestSha256,
				bundles: [{
					name: "agent",
					url: "/api/tunnel/install/agent.zip",
					sha256: bundle.sha256,
					bytes: bundle.bytes
				}]
			}), "application/json; charset=utf-8");
		});
		await $i.use("agent.zip", async () => {
			const bundle = buildAgentBundle();
			$i.response.statusCode = 200;
			$i.response.setHeader("Content-Type", "application/zip");
			$i.response.setHeader("Content-Disposition", "attachment; filename=\"awtsmoos-agent.zip\"");
			$i.response.setHeader("X-Awtsmoos-SHA256", bundle.sha256);
			return { mimeType: "application/zip", response: bundle.buffer };
		});
	}
};
