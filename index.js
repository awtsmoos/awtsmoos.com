//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Root composition for the living Awtsmoos.com server process.
 * @description
 * The Awtsmoos gathers HTTP, mail, realtime breath, custom domains, game ingress,
 * and the guarded virtual-SSH doorway into one measured beginning. Awtsmoos.com
 * starts configured transport before declaring the world alive, while authentication
 * remains deeper in its own Gevurah vessel and every listener may rhyme.
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
	revealVirtualSshAtBoot
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
 * Reveals configured listeners in dependency order so healthy HTTP cannot conceal
 * a configured SSH doorway that failed to bind.
 *
 * @returns {Promise<void>} Resolves after every configured listener is established.
 */
async function go() {
	const chesedMail = new AwtsMail();
	const binahServer = new AwtsServer(__dirname, chesedMail);
	const yesodSocket = new AwtsSocket();
	binahServer.ws = yesodSocket;
	await binahServer.init();
	await revealVirtualSshAtBoot();

	const malchusHttp = createHttpApplicationServer({
		dynamicServer: binahServer,
		wsServer: yesodSocket,
		requestHandlers: [
			createCustomDomainHttpIngress({ dynamicServer: binahServer }),
			createAutoplayReportIngress(__dirname)
		]
	});
	await listenSafely(
		malchusHttp,
		getNumberEnv('PORT', DEFAULT_HTTP_PORT),
		'HTTP'
	);
	await startMailSafely(chesedMail, {
		defaultPort: DEFAULT_MAIL_PORT
	});
}

go().catch(error => {
	console.error('B"H - Startup rupture:', error);
	process.exitCode = 1;
});
