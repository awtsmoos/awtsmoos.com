//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Canonical Awtsmoos.com process composition root.
 * @description
 * The Awtsmoos gathers mail, realtime breath, HTTP ingress, tenant worlds, Torah authority,
 * and guarded service doors into one measured awakening. Awtsmoos.com announces a living
 * runtime only after required storage vessels have awakened beneath one truthful light.
 */
const fs = require("node:fs");
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");
const {
	createHttpApplicationServer
} = require("./ayzarim/awtsmoosDynamicServer/server/httpApplicationServer.js");
const {
	faviconIngress
} = require("./ayzarim/awtsmoosDynamicServer/server/faviconIngress.js");
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
	warmRichCommentAuthority
} = require("./ayzarim/awtsmoosDynamicServer/server/richCommentWarmup.js");
const richCommentPackedStore = require("./geelooy/api/social/helper/comments/richDb/PackedStore.js");
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
 * Warms heavyweight request authorities only when explicitly requested.
 * The packed commentary database can be very large; eagerly materializing its
 * filesystem manifest before listen() can make production appear dead and hold
 * over a gigabyte before the first request. Normal production therefore opens
 * immediately and lets the canonical store hydrate lazily.
 */
function warmRequestAuthorities(dynamicServer) {
	if (process.env.AWTSMOOS_WARM_RICH_COMMENTS !== "true") {
		return { warmed: false, skipped: true, reason: "startup_warmup_disabled" };
	}
	const result = warmRichCommentAuthority(dynamicServer, {
		fs,
		packedStore: richCommentPackedStore
	});
	if (result.warmed) {
		console.log(`B"H - Startup stage rich-comment-warmup: ${result.elapsedMs} ms`);
	}
	return result;
}

/** Starts every configured process-level vessel in dependency order. */
async function revealAwtsmoosRuntime() {
	const runtimeHealth = createRuntimeHealth();
	const httpAdmission = createHttpAdmission();
	const mailDisabled = process.env.AWTSMOOS_DISABLE_MAIL === "true";
	const malchusMail = mailDisabled ? null : new AwtsMail();
	const binahDynamicServer = new AwtsServer(__dirname, malchusMail);
	const yesodSocketServer = new AwtsSocket();
	binahDynamicServer.ws = yesodSocketServer;
	await binahDynamicServer.init();
	warmRequestAuthorities(binahDynamicServer);
	await startConfiguredVirtualSsh();
	const tiferesHttpServer = createHttpApplicationServer({
		dynamicServer: binahDynamicServer,
		wsServer: yesodSocketServer,
		requestHandlers: [
			runtimeHealth.handle,
			httpAdmission.handle,
			faviconIngress,
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

/** Marks a composition-root failure as process-fatal after emitting bounded testimony. */
function reportStartupRupture(error) {
	console.error('B"H - Startup rupture:', error);
	process.exitCode = 1;
}

revealAwtsmoosRuntime().catch(reportStartupRupture);
