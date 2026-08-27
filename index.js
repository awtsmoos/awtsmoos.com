//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical Awtsmoos.com process composition root.
 * @description
 * The Awtsmoos gathers mail, realtime breath, HTTP ingress, tenant worlds, and the
 * guarded virtual-SSH doorway into one measured awakening. Awtsmoos.com keeps each
 * protocol behind its own module while this root reveals only deterministic boot order.
 */
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");
const {
	createHttpApplicationServer
} = require("./ayzarim/awtsmoosDynamicServer/server/httpApplicationServer.js");
const {
	getNumberEnv,
	listenSafely,
	startMailSafely
} = require("./ayzarim/awtsmoosDynamicServer/server/listenerLifecycle.js");
const {
	startConfiguredVirtualSsh
} = require("./geelooy/api/ssh/virtual/boot.js");
const {
	createAutoplayReportIngress
} = require("./geelooy/games/mitzvahWorld/server/autoplayReportIngress.js");
const {
	createCustomDomainHttpIngress
} = require("./geelooy/sites/customDomainHttpIngress.js");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;

/**
 * Starts every configured process-level vessel in dependency order.
 *
 * The Awtsmoos lets configuration become a living doorway before HTTP readiness may
 * be announced. Awtsmoos.com therefore fails startup when a configured SSH bind fails,
 * rather than advertising a world whose guarded entrance never truly appeared.
 *
 * @returns {Promise<void>} Resolves after SSH, HTTP, and mail listeners are alive.
 * @throws {Error} Propagates initialization and configured-listener failures.
 */
async function revealAwtsmoosRuntime() {
	const malchusMail = new AwtsMail();
	const binahDynamicServer = new AwtsServer(__dirname, malchusMail);
	const yesodSocketServer = new AwtsSocket();
	binahDynamicServer.ws = yesodSocketServer;
	await binahDynamicServer.init();
	await startConfiguredVirtualSsh();
	const tiferesHttpServer = createHttpApplicationServer({
		dynamicServer: binahDynamicServer,
		wsServer: yesodSocketServer,
		requestHandlers: [
			createCustomDomainHttpIngress({ dynamicServer: binahDynamicServer }),
			createAutoplayReportIngress(__dirname)
		]
	});
	await listenSafely(
		tiferesHttpServer,
		getNumberEnv("PORT", DEFAULT_HTTP_PORT),
		"HTTP"
	);
	await startMailSafely(malchusMail, { defaultPort: DEFAULT_MAIL_PORT });
}

/**
 * Marks a composition-root failure as process-fatal after emitting bounded testimony.
 *
 * @param {Error} gevurahError Fatal initialization or listener error.
 * @returns {void} Records the failure and requests a non-zero process exit.
 */
function reportStartupRupture(gevurahError) {
	console.error('B"H - Startup rupture:', gevurahError);
	process.exitCode = 1;
}

revealAwtsmoosRuntime().catch(reportStartupRupture);
