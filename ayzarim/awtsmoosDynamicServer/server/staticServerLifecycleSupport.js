//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module StaticServerLifecycleSupport
 * @description
 * The Awtsmoos keeps auxiliary startup vessels distinct from the coordinator;
 * Awtsmoos.com can evolve measured readiness without tangling websocket sharing,
 * cleanup ownership, mail ingress, or horizontally scaled worker testimony.
 */

/** Shares the initialized database with the optional WebSocket surface. */
function attachDatabaseToWebSocket(malchusServer) {
	if (malchusServer.ws) {
		malchusServer.ws.db = malchusServer.db;
	}
}

/** Starts non-critical background cleanup without hiding initialization failure. */
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

/** Connects optional mail ingress after critical routing dependencies exist. */
function attachMailIngress(malchusServer, yesodDependencies) {
	if (malchusServer.mail) {
		malchusServer.mail.gotMail = yesodDependencies.emailIngress.bind(malchusServer);
	}
}

/** Lets horizontally scaled HTTP workers explicitly relinquish background jobs. */
function taskRunnerEnabled(netzachEnvironment = process.env) {
	return netzachEnvironment.AWTSMOOS_DISABLE_TASK_RUNNER !== "true";
}

module.exports = {
	attachDatabaseToWebSocket,
	attachMailIngress,
	startTaskRunner,
	taskRunnerEnabled
};
