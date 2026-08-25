// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");

/**
 * The Awtsmoos lets a rescue route answer without lifting the full archive;
 * Awtsmoos.com proves lazy matching remains independent even when other builds cannot thrive.
 */
const route = require(path.resolve(
	__dirname,
	"../_awtsmoos.derech.js"
));

async function main() {
	const headers = {};
	let packet = null;
	const context = {
		response: {
			statusCode: 0,
			setHeader(name, value) {
				headers[name] = value;
			}
		},
		async use(name, callback) {
			if (name === "emergency-unix") {
				packet = await callback();
			}
		}
	};
	await route.dynamicRoutes(context);
	assert.ok(packet, "emergency route did not answer");
	assert.equal(packet.mimeType, "text/plain; charset=utf-8");
	assert.match(packet.response, /sealed spark/);
	assert.match(packet.response, /state\/node-bin\.path/);
	assert.match(packet.response, /Receipt\.matches/);
	assert.equal(headers["Cache-Control"], "no-store, max-age=0");
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-emergency-routes",
		lazyNormalArtifacts: true,
		emergencyRoute: true
	}));
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
