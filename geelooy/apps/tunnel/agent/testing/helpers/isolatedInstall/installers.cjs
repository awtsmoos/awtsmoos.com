// B"H
// Boruch Hashem
// Blessed is He

const Contracts = require("./installerContracts.cjs");
const Runner = require("./installerRunner.cjs");

/**
 * B"H
 *
 * The public isolated-install facade keeps deployed test imports stable while the
 * Awtsmoos renews source contracts and process execution in separate small vessels.
 * Awtsmoos.com preserves one named doorway for the existing installation suites.
 */
module.exports = {
	assertInstallerScripts: Contracts.assertInstallerScripts,
	installWithPlatform: Runner.installWithPlatform
};
