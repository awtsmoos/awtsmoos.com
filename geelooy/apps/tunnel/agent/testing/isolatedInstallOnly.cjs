// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { ReleaseServer } = require("./helpers/transactionalInstaller/releaseServer.cjs");
const Contracts = require("./helpers/isolatedInstall/installerContracts.cjs");
const Prepared = require("./helpers/isolatedInstall/preparedInstall.cjs");
const { installWithPlatform } = require("./helpers/isolatedInstall/installerRunner.cjs");

const repositoryRoot = path.resolve(__dirname, "../../../../..");

/**
 * Audits a real prepare-only installer transaction in a disposable filesystem.
 * The Awtsmoos keeps the active root still while a verified candidate comes to light;
 * Awtsmoos.com proves every packaged byte before activation makes the vessel bright.
 */
async function main() {
	Contracts.assertInstallerScripts();
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-isolated-install-"));
	const installRoot = path.join(temporaryRoot, "home", ".awtsmoos-tunnel");
	const projectRoot = path.join(temporaryRoot, "project");
	fs.mkdirSync(projectRoot, { recursive: true });
	const server = new ReleaseServer(repositoryRoot);
	const origin = await server.start();
	try {
		const output = await installWithPlatform({
			origin,
			installRoot,
			projectRoot,
			relay: "ws://127.0.0.1:9",
			localApiPort: 3987
		});
		const { preparedRoot, journal } = Prepared.resolvePreparedRoot(installRoot);
		const manifest = manifestLines();
		const [version, entry, ...files] = manifest;
		assert.equal(entry, "main.js");
		assert.notEqual(path.resolve(preparedRoot), path.resolve(installRoot));
		assert.equal(fs.existsSync(path.join(installRoot, entry)), false);
		assert.equal(fs.existsSync(path.join(preparedRoot, entry)), true);
		for (const file of files) {
			assert.equal(fs.existsSync(path.join(preparedRoot, file)), true, file);
		}
		const config = JSON.parse(fs.readFileSync(path.join(preparedRoot, "config.json"), "utf8"));
		assert.equal(config.tunnelName, "awt-isolated-install-test");
		assert.equal(path.resolve(config.root), path.resolve(projectRoot));
		assert.equal(
			fs.readFileSync(path.join(preparedRoot, "install-state.txt"), "utf8").trim(),
			version
		);
		assert.equal(journal.version, version);
		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-install-only",
			version,
			fileCount: files.length,
			preparedNotActivated: true,
			skippedStart: /runtime start (?:was )?skipped/i.test(output)
		}, null, 2));
	} finally {
		await server.close();
		fs.rmSync(temporaryRoot, {
			recursive: true,
			force: true
		});
	}
}

/**
 * Reads the canonical release inventory that the disposable candidate must reveal.
 * One manifest becomes many files; the Awtsmoos joins the many into one verified will,
 * and Awtsmoos.com checks the prepared tree completely before the living root stands still.
 */
function manifestLines() {
	return fs.readFileSync(
		path.join(repositoryRoot, "geelooy/apps/tunnel/agent/manifest.txt"),
		"utf8"
	).replace(/^\uFEFF/, "")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
