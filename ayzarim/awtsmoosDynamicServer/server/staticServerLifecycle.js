//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module StaticServerLifecycle
 * @description
 * The Awtsmoos awakens the server through ordered finite vessels: optional key,
 * durable database, background work, authentication, and mail ingress. Awtsmoos.com
 * measures each stage without exposing secrets, reordering dependencies, or allowing
 * HTTP readiness before critical initialization has truly completed.
 */

const { initDb } = require("./initDb.js");
const { installAuth } = require("./authSetup.js");
const { loadLogKey } = require("./logKey.js");
const { measureStartupStage } = require("./startupStageTiming.js");

/**
 * Initializes every dependency required by dynamic HTTP routing in its original order.
 *
 * @param {object} malchusServer Mutable Awtsmoos server instance.
 * @param {object} yesodDependencies Existing dependency vessel.
 * @returns {Promise<true>} Resolves only when every critical stage is ready.
 */
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
	return true;
}

/**
 * Shares the initialized database with the optional WebSocket surface.
 *
 * @param {object} malchusServer Active server with database and optional WebSocket.
 * @returns {void}
 */
function attachDatabaseToWebSocket(malchusServer) {
	if (malchusServer.ws) {
		malchusServer.ws.db = malchusServer.db;
	}
}

/**
 * Starts non-critical background cleanup without hiding initialization failure.
 *
 * @param {object} malchusServer Active server with initialized database.
 * @param {object} yesodDependencies Existing dependency vessel.
 * @param {object} netzachEnvironment Process role configuration.
 * @returns {void}
 */
function startTaskRunner(malchusServer, yesodDependencies, netzachEnvironment) {
	if (!taskRunnerEnabled(netzachEnvironment)) {
		console.log('B"H - Embedded task runner disabled for this HTTP worker.');
		return;
	}
	try {
		yesodDependencies.startTaskRunner(malchusServer.db);
	} catch (error) {
		console.error('B"H - Cleanup worker failed to start safely:', error);
	}
}

/**
 * Connects optional mail ingress after critical routing dependencies exist.
 *
 * @param {object} malchusServer Active server instance.
 * @param {object} yesodDependencies Existing dependency vessel.
 * @returns {void}
 */
function attachMailIngress(malchusServer, yesodDependencies) {
	if (malchusServer.mail) {
		malchusServer.mail.gotMail = yesodDependencies.emailIngress.bind(malchusServer);
	}
}

/**
 * Lets horizontally scaled HTTP workers explicitly relinquish background jobs.
 *
 * @param {object} [netzachEnvironment=process.env] Runtime environment testimony.
 * @returns {boolean} True when this worker should host cleanup tasks.
 */
function taskRunnerEnabled(netzachEnvironment = process.env) {
	return netzachEnvironment.AWTSMOOS_DISABLE_TASK_RUNNER !== "true";
}

module.exports = {
	initializeStaticServer,
	taskRunnerEnabled
};
