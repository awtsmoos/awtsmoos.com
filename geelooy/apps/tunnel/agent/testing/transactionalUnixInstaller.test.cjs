// B"H
// Boruch Hashem
// Blessed is He

const Fresh = require("./helpers/transactionalInstaller/cases/freshInstall.cjs");
const Incomplete = require("./helpers/transactionalInstaller/cases/incompleteBundle.cjs");
const Rollback = require("./helpers/transactionalInstaller/cases/crashingRollback.cjs");

/**
 * B"H — Three independent worlds reveal one transactional covenant: complete
 * installation, preactivation restraint, and verified return to an older life.
 */
async function main() {
	const results = [
		await Fresh.run(),
		await Incomplete.run(),
		await Rollback.run()
	];
	console.log(JSON.stringify({
		ok: true,
		suite: "transactional-unix-installer",
		results
	}, null, 2));
}

main().catch(error => {
	console.error(error && (error.stack || error.message || String(error)));
	process.exitCode = 1;
});
