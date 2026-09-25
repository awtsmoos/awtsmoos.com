//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module StaticServerLifecycle
 * @description
 * The Awtsmoos awakens every critical server dependency in measured order;
 * Awtsmoos.com begins optional search warming only after readiness dependencies
 * are established, so cold corpus work can never delay HTTP availability.
 */

const { initDb } = require("./initDb.js");
const { installAuth } = require("./authSetup.js");
const { loadLogKey } = require("./logKey.js");
const { startSearchStartupWarmup } = require("./searchStartupWarmup.js");
const { measureStartupStage } = require("./startupStageTiming.js");
const {
	attachDatabaseToWebSocket,
	attachMailIngress,
	startTaskRunner,
	taskRunnerEnabled
} = require("./staticServerLifecycleSupport.js");

/** Initializes dynamic HTTP dependencies without awaiting optional search warmup. */
async function initializeStaticServer(malchusServer, yesodDependencies) {
	if (!yesodDependencies.config) {
		throw new Error("Awtsmoos server configuration is unavailable.");
	}
	malchusServer.firebaseKey = await measureStartupStage(
		"load-log-key",
		() => loadLogKey(yesodDependencies)
	);
	malchusServer.db = await measureStartupStage(
		"database-init",
		() => initDb(yesodDependencies, malchusServer.directory)
	);
	if (!malchusServer.db) {
		throw new Error("Awtsmoos database initialization returned no database.");
	}
	attachDatabaseToWebSocket(malchusServer);
	await measureStartupStage(
		"task-runner-start",
		() => startTaskRunner(malchusServer, yesodDependencies, process.env)
	);
	await measureStartupStage(
		"auth-install",
		() => installAuth(malchusServer, yesodDependencies, malchusServer.directory)
	);
	attachMailIngress(malchusServer, yesodDependencies);
	malchusServer.searchWarmup = startSearchStartupWarmup(
		malchusServer,
		process.env
	);
	return true;
}

module.exports = {
	initializeStaticServer,
	taskRunnerEnabled
};
