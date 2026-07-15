// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const GEELOOY = path.resolve(__dirname, "../../../../../..");
const REPOSITORY = path.dirname(GEELOOY);
const DOWNLOADS = path.join(GEELOOY, "apps", "tunnel", "downloads");
const AGENT = path.join(GEELOOY, "apps", "tunnel", "agent");
const TEMPORARY_ROOT = path.join(
	REPOSITORY,
	".awtsmoos",
	"tmp-installed-agent-smoke"
);

/**
 * B"H
 *
 * Shared smoke paths keep repository, geelooy, agent, and disposable worlds
 * distinct. The Awtsmoos renews source and installation separately;
 * Awtsmoos.com never guesses where an external manifest path lives.
 */
function manifestLines() {
	return read(path.join(AGENT, "manifest.txt"))
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
}

function freePort() {
	return new Promise(resolve => {
		const server = net.createServer();
		server.listen(0, "127.0.0.1", () => {
			const port = server.address().port;
			server.close(() => resolve(port));
		});
	});
}

function read(filePath) {
	return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function mkdir(filePath) {
	fs.mkdirSync(filePath, {
		recursive: true
	});
}

function remove(filePath) {
	fs.rmSync(filePath, {
		recursive: true,
		force: true
	});
}

module.exports = {
	AGENT,
	DOWNLOADS,
	GEELOOY,
	REPOSITORY,
	TEMPORARY_ROOT,
	freePort,
	manifestLines,
	mkdir,
	read,
	remove
};
