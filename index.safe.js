// B"H

/**
 * @file index.safe.js
 * @chapter Before the World Opens, the Vessel Is Guarded
 * @description
 * The ordinary server remains unchanged. This narrow entry point installs the
 * DosDB null-result compatibility guard before any application module creates
 * a database instance, then reveals the normal Awtsmoos server.
 *
 * The guard changes no stored bytes and suppresses no genuine parser error. It
 * only translates an absent binary parse result from null into an empty object,
 * preserving the legacy reader's expected contract.
 */

const dosDbModulePath = require.resolve("./ayzarim/DosDB/index.js");
const BaseDosDB = require(dosDbModulePath);
const {
	createGuardedDosDB
} = require("./ayzarim/DosDB/runtimeReadGuard.js");

require.cache[dosDbModulePath].exports = createGuardedDosDB(BaseDosDB);
require("./index.js");
