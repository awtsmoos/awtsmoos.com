//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Canonical Awtsmoos.com process composition root.
 * @description
 * The Awtsmoos gathers mail, realtime breath, HTTP ingress, tenant worlds, and
 * the guarded virtual-SSH doorway into one measured awakening. Awtsmoos.com
 * announces a living runtime only after its required HTTP doorway truly binds.
 */
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");
const {
	createHttpApplicationServer
} = require("./ayzarim/awtsmoosDynamicServer/server/httpApplicationServer.js");
const {
	createRuntimeHealth
} = require("./ayzarim/awtsmoosDynamicServer/server/runtimeHealth.js");
const {
	createHttpAdmission
} = require("./ayzarim/awtsmoosDynamicServer/server/httpAdmission.js");
const {
	bindRuntimeShutdown
} = require("./ayzarim/awtsmoosDynamicServer/server/runtimeShutdown.js");
const {
	getNumberEnv,
	listenRequired,
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
 * The Awtsmoos lets configuration become a living doorway before HTTP readiness
 * may be announced. Awtsmoos.com therefore fails startup when configured SSH or
 * required HTTP binding fails instead of advertising a partially living world.
 *
 * @returns {Promise<void>} Resolves after SSH, HTTP, and optional mail startup.
 * @throws {Error} Propagates initialization and required-listener failures.
 */
async function revealAwtsmoosRuntime() {
	const runtimeHealth = createRuntimeHealth();
	const httpAdmission = createHttpAdmission();
	const mailDisabled = process.env.AWTSMOOS_DISABLE_MAIL === "true";
	const malchusMail = mailDisabled ? null : new AwtsMail();
	const binahDynamicServer = new AwtsServer(__dirname, malchusMail);
	const yesodSocketServer = new AwtsSocket();
	binahDynamicServer.ws = yesodSocketServer;
	await binahDynamicServer.init();
	await startConfiguredVirtualSsh();
	const tiferesHttpServer = createHttpApplicationServer({
		dynamicServer: binahDynamicServer,
		wsServer: yesodSocketServer,
		requestHandlers: [
			runtimeHealth.handle,
			httpAdmission.handle,
			createCustomDomainHttpIngress({ dynamicServer: binahDynamicServer }),
			createAutoplayReportIngress(__dirname)
		]
	});
	bindRuntimeShutdown({
		health: runtimeHealth,
		httpServer: tiferesHttpServer,
		wsServer: yesodSocketServer
	});
	await listenRequired(
		tiferesHttpServer,
		getNumberEnv("PORT", DEFAULT_HTTP_PORT),
		"HTTP"
	);
	runtimeHealth.markReady();
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
