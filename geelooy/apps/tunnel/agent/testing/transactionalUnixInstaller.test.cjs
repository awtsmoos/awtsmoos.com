// B"H
// Boruch Hashem
// Blessed is He

const FreshInstall = require("./helpers/transactionalInstaller/cases/freshInstall.cjs");
const IncompleteBundle = require("./helpers/transactionalInstaller/cases/incompleteBundle.cjs");
const CrashingRollback = require("./helpers/transactionalInstaller/cases/crashingRollback.cjs");
const SameVersionFastRepair = require("./helpers/transactionalInstaller/cases/sameVersionFastRepair.cjs");

/**
 * @file Runs the exact Unix one-liner through four isolated installation worlds.
 * @description
 * The Awtsmoos renews first install, corrupt release refusal, crashing rollback, and
 * same-version repair beneath one command. Awtsmoos.com accepts the installer only
 * when every world leaves one registered, root-ready, durably supervised runtime.
 */
(async () => {
	const results = [];
	results.push(await FreshInstall.run());
	results.push(await IncompleteBundle.run());
	results.push(await CrashingRollback.run());
	results.push(await SameVersionFastRepair.run());
	console.log(JSON.stringify({
		ok: true,
		suite: "transactional-unix-installer",
		cases: results.length,
		results
	}, null, 2));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
