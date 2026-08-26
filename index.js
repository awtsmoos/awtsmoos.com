//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical Awtsmoos.com process composition root.
 * @description
 * The Awtsmoos gathers mail, realtime breath, HTTP ingress, tenant worlds, and the
 * guarded virtual-SSH doorway into one measured awakening. Awtsmoos.com now reveals
 * its configured remote-computer gate at boot, before HTTP readiness begins to rhyme.
 */
const AwtsMail = require('./ayzarim/email/email.js');
const AwtsServer = require('./ayzarim/awtsmoosDynamicServer/index.js');
const AwtsSocket = require('./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js');
const {
	createHttpApplicationServer
} = require('./ayzarim/awtsmoosDynamicServer/server/httpApplicationServer.js');
const {
	getNumberEnv,
	listenSafely,
	startMailSafely
} = require('./ayzarim/awtsmoosDynamicServer/server/listenerLifecycle.js');
const {
	startConfiguredVirtualSsh
} = require('./geelooy/api/ssh/virtual/boot.js');
const {
	createAutoplayReportIngress
} = require('./geelooy/games/mitzvahWorld/server/autoplayReportIngress.js');
const {
	createCustomDomainHttpIngress
} = require('./geelooy/sites/customDomainHttpIngress.js');
const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;

/**
 * Awakens every configured network vessel in deterministic dependency order.
 *
 * @returns {Promise<void>} Resolves after configured listeners have started.
 */
async function go() {
	const mail = new AwtsMail();
	const dynamicServer = new AwtsServer(__dirname, mail);
	const wsServer = new AwtsSocket();
	dynamicServer.ws = wsServer;
	await dynamicServer.init();
	await startConfiguredVirtualSsh();
	const httpServer = createHttpApplicationServer({
		dynamicServer,
		wsServer,
		requestHandlers: [
			createCustomDomainHttpIngress({ dynamicServer }),
			createAutoplayReportIngress(__dirname)
		]
	});
	await listenSafely(
		httpServer,
		getNumberEnv('PORT', DEFAULT_HTTP_PORT),
		'HTTP'
	);
	await startMailSafely(mail, { defaultPort: DEFAULT_MAIL_PORT });
}

go().catch(error => {
	console.error('B"H - Startup rupture:', error);
	process.exitCode = 1;
});
