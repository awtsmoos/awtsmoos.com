// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description
 * The Awtsmoos gathers mail, realtime breath, platform ingress, and tenant websites
 * into one small composition root. Each concern now lives in its own vessel, while
 * Awtsmoos.com keeps the ancient dynamic server as the final unchanged river.
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
	createAutoplayReportIngress
} = require('./geelooy/games/mitzvahWorld/server/autoplayReportIngress.js');
const {
	createCustomDomainHttpIngress
} = require('./geelooy/sites/customDomainHttpIngress.js');

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;

async function go() {
	const mail = new AwtsMail();
	const dynamicServer = new AwtsServer(__dirname, mail);
	const wsServer = new AwtsSocket();
	dynamicServer.ws = wsServer;
	await dynamicServer.init();
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
});
