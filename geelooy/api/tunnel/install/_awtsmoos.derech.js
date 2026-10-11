// B"H
// Boruch Hashem
// Blessed is He

const { registerScriptRoute } = require("./tools/scriptRoute.js");
const { buildAgentBundle } = require("./tools/zipBundle.js");
const { buildInstallerComponents } = require("./tools/installerComponents.js");
const { getBundle, bundleNames } = require("./tools/runtimeBundles.js");
const { sendText } = require("./tools/respond.js");
const Descriptor = require("./tools/bundleDescriptor.js");

/**
 * @file Publishes full installers and independent rescue doors.
 * @description
 * The Awtsmoos renews each route from source; Awtsmoos.com lets a tiny emergency
 * spark answer without first carrying release metadata, agent ZIP, or installer floor.
 */
module.exports = {
	dynamicRoutes: async $i => {
		setPublicHeaders($i);
		await registerScriptRoute($i, "windows", "windows.ps1");
		await registerScriptRoute($i, "linux", "unix.sh");
		await registerScriptRoute($i, "unix", "unix.sh");
		await registerScriptRoute($i, "emergency-unix", "emergency-auto.sh");
		await registerScriptRoute($i, "emergency-sealed", "emergency-sealed.sh");
		await registerScriptRoute($i, "emergency-supervisor", "emergency-supervisor.sh");
		await registerScriptRoute($i, "emergency-known-good", "emergency-known-good.sh");
		await registerScriptRoute($i, "emergency-diagnose", "emergency-diagnose.sh");
		await registerScriptRoute($i, "emergency-repair", "emergency-repair.sh");
		await $i.use(
			"installer-components.tar.gz",
			async () => publishInstallerComponents($i)
		);
		await $i.use(
			"bundle-manifest",
			async () => publishDescriptor($i)
		);
		await $i.use(
			"agent.zip",
			async () => publishAgentZip($i)
		);
		// Self-contained runtime bundles (Yaakov 2026-10-11 hard rule: nothing
		// installed may depend on the repo). Served as tar.gz + .sha256.
		for (const name of bundleNames()) {
			await $i.use(
				`runtime/${name}.tar.gz`,
				async () => publishRuntimeBundle($i, name)
			);
			await $i.use(
				`runtime/${name}.tar.gz.sha256`,
				async () => publishRuntimeBundleHash($i, name)
			);
		}
	}
};

/** Publishes the verified helper archive for the full installer only. */
function publishInstallerComponents($i) {
	const bundle = buildInstallerComponents();
	$i.response.statusCode = 200;
	$i.response.setHeader("Content-Type", "application/gzip");
	$i.response.setHeader(
		"Content-Disposition",
		'attachment; filename="awtsmoos-installer-components.tar.gz"'
	);
	$i.response.setHeader("X-Awtsmoos-SHA256", bundle.sha256);
	$i.response.setHeader("X-Awtsmoos-Files", String(bundle.files));
	$i.response.setHeader("Content-Length", String(bundle.bytes));
	return {
		mimeType: "application/gzip",
		response: bundle.buffer
	};
}

/** Publishes release metadata for complete-agent consumers. */
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

/** Publishes the full agent ZIP; rescue script requests never execute this path. */
function publishAgentZip($i) {
	const bundle = buildAgentBundle();
	$i.response.statusCode = 200;
	$i.response.setHeader("Content-Type", "application/zip");
	$i.response.setHeader(
		"Content-Disposition",
		'attachment; filename="awtsmoos-agent.zip"'
	);
	$i.response.setHeader("X-Awtsmoos-SHA256", bundle.sha256);
	$i.response.setHeader("X-Awtsmoos-Manifest-SHA256", bundle.manifestSha256);
	$i.response.setHeader("Content-Length", String(bundle.bytes));
	return {
		mimeType: "application/zip",
		response: bundle.buffer
	};
}

/** Applies public no-cache headers to installer and rescue responses. */
function setPublicHeaders($i) {
	$i.response.setHeader("Access-Control-Allow-Origin", "*");
	$i.response.setHeader("Cache-Control", "no-store, max-age=0");
	$i.response.setHeader("Pragma", "no-cache");
}

/** Publishes one self-contained runtime bundle tarball for installed tunnels. */
function publishRuntimeBundle($i, name) {
	const bundle = getBundle(name);
	$i.response.statusCode = 200;
	$i.response.setHeader("Content-Type", "application/gzip");
	$i.response.setHeader(
		"Content-Disposition",
		`attachment; filename="awtsmoos-${name}.tar.gz"`
	);
	$i.response.setHeader("X-Awtsmoos-SHA256", bundle.sha256);
	$i.response.setHeader("X-Awtsmoos-Files", String(bundle.files));
	$i.response.setHeader("Content-Length", String(bundle.bytes));
	return {
		mimeType: "application/gzip",
		response: bundle.buffer
	};
}

/** Publishes the sha256 of one runtime bundle for installed-tunnel verification. */
function publishRuntimeBundleHash($i, name) {
	const bundle = getBundle(name);
	return sendText($i, `${bundle.sha256}  awtsmoos-${name}.tar.gz\n`, "text/plain; charset=utf-8");
}
