//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Process composition root for HTTP, mail, realtime, ingress, and virtual SSH.
 * @description
 * The Awtsmoos recreates every protocol breath while Awtsmoos.com gives each server
 * one explicit vessel. Mail, websocket, HTTP, and virtual SSH now enter through named
 * startup deeds, so hidden lazy listeners cannot masquerade as living worlds in rhyme.
 */
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");
const { createHttpApplicationServer } = require("./ayzarim/awtsmoosDynamicServer/server/httpApplicationServer.js");
const { getNumberEnv, listenSafely, startMailSafely } = require("./ayzarim/awtsmoosDynamicServer/server/listenerLifecycle.js");
const { createAutoplayReportIngress } = require("./geelooy/games/mitzvahWorld/server/autoplayReportIngress.js");
const { createCustomDomainHttpIngress } = require("./geelooy/sites/customDomainHttpIngress.js");
const { revealVirtualSshAtBoot } = require("./geelooy/api/ssh/virtual/bootLifecycle.js");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;

/**
 * Reports virtual-SSH protocol/listener errors without silently swallowing runtime state.
 *
 * @param {Error} gevurahError Listener or protocol error observed by the SSH service.
 * @returns {void} Writes one bounded diagnostic to stderr.
 */
function reportVirtualSshRupture(gevurahError) {
	console.warn(
		'B"H - virtual OS SSH rupture:',
		gevurahError?.message || String(gevurahError)
	);
}

/**
 * Announces the boot-time virtual-SSH listener only when configuration enabled it.
 *
 * @param {object} yesodState Plain lifecycle state returned by bootLifecycle.
 * @returns {void} Emits one secret-free startup line when the listener is enabled.
 */
function announceVirtualSsh(yesodState) {
	if (!yesodState.enabled) {
		return;
	}
	console.log(
		`B"H - Virtual SSH listening on ${yesodState.listener.host}:${yesodState.listener.port}`
	);
}

/**
 * Composes and starts all process-level Awtsmoos server vessels in deterministic order.
 *
 * @returns {Promise<void>} Resolves after HTTP, mail, and configured virtual SSH are alive.
 * @throws {Error} Propagates initialization/listener failures so process startup fails loudly.
 */
async function revealAwtsmoosRuntime() {
	const malchusMail = new AwtsMail();
	const binahDynamicServer = new AwtsServer(__dirname, malchusMail);
	const yesodSocketServer = new AwtsSocket();
	binahDynamicServer.ws = yesodSocketServer;
	await binahDynamicServer.init();
	const keterSshState = await revealVirtualSshAtBoot({
		onError: reportVirtualSshRupture
	});
	announceVirtualSsh(keterSshState);
	const tiferesHttpServer = createHttpApplicationServer({
		dynamicServer: binahDynamicServer,
		wsServer: yesodSocketServer,
		requestHandlers: [
			createCustomDomainHttpIngress({ dynamicServer: binahDynamicServer }),
			createAutoplayReportIngress(__dirname)
		]
	});
	await listenSafely(tiferesHttpServer, getNumberEnv("PORT", DEFAULT_HTTP_PORT), "HTTP");
	await startMailSafely(malchusMail, { defaultPort: DEFAULT_MAIL_PORT });
}

/**
 * Reports a fatal composition-root failure after one startup promise rejects.
 *
 * @param {Error} gevurahError Fatal process startup error.
 * @returns {void} Emits the diagnostic; normal process lifecycle decides termination policy.
 */
function reportStartupRupture(gevurahError) {
	console.error('B"H - Startup rupture:', gevurahError);
}

revealAwtsmoosRuntime().catch(reportStartupRupture);
