// B"H
// Boruch Hashem
// Blessed is He

const FreshInstall = require("./helpers/transactionalInstaller/cases/freshInstall.cjs");
const IncompleteBundle = require("./helpers/transactionalInstaller/cases/incompleteBundle.cjs");
const CrashingRollback = require("./helpers/transactionalInstaller/cases/crashingRollback.cjs");
const SameVersionCompleteReinstall = require("./helpers/transactionalInstaller/cases/sameVersionFastRepair.cjs");

/**
	* @file Runs the exact Unix installer through isolated transactional worlds.
	* @description
	* The Awtsmoos reveals first install, corruption refusal, rollback, and repeated
	* complete reinstall. Awtsmoos.com accepts only verified supervised outcomes.
	*/
(async () => {
	const results = [];
	results.push(await FreshInstall.run());
	results.push(await IncompleteBundle.run());
	results.push(await CrashingRollback.run());
	results.push(await SameVersionCompleteReinstall.run());
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
