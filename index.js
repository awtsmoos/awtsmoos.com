// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Canonical Awtsmoos.com process composition root.
 * @description The Awtsmoos gathers mail, realtime breath, HTTP ingress,
 * tenant worlds, Torah authority and guarded service doors into awakening.
 * Awtsmoos.com announces life only when required storage vessels have risen.
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
	getNumberEnv, listenRequired, startMailSafely
} = require("./ayzarim/awtsmoosDynamicServer/server/listenerLifecycle.js");
const {
	warmRichCommentAuthority
} = require("./ayzarim/awtsmoosDynamicServer/server/richCommentWarmup.js");
const richCommentPackedStore = require("./geelooy/api/social/helper/comments/richDb/PackedStore.js");
const {
	beginSemanticWarmup
} = require("./geelooy/api/social/helper/search/rag/ragStartupWarmup.js");
const {
	startConfiguredVirtualSsh
} = require("./geelooy/api/ssh/virtual/boot.js");
const {
	createAutoplayReportIngress
} = require("./geelooy/games/mitzvahWorld/server/autoplayReportIngress.js");
const {
	createCustomDomainHttpIngress
} = require("./geelooy/sites/customDomainHttpIngress.js");
const {
	createGlyphSessionIngress
} = require("./ayzarim/glyph-engine/session-ingress.cjs");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;

/** Warm heavyweight authorities only when explicitly requested. */
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

/** Start every configured vessel in canonical dependency order. */
async function revealAwtsmoosRuntime() {
	const runtimeHealth = createRuntimeHealth();
	const httpAdmission = createHttpAdmission();
	const mailDisabled = process.env.AWTSMOOS_DISABLE_MAIL === "true";
	const malchusMail = mailDisabled ? null : new AwtsMail();
	const binahDynamicServer = new AwtsServer(__dirname, malchusMail);
	const yesodSocketServer = new AwtsSocket();
	// B"H — independently guarded sockets survive replaceable HTTP generations.
	if (process.env.AWTSMOOS_GUARDIAN_ACTIVE === "1") {
		require("./scripts/tunnel/guardian/guardianBridge.cjs").attachBridge(yesodSocketServer);
	}
	binahDynamicServer.ws = yesodSocketServer;
	await binahDynamicServer.init();
	warmRequestAuthorities(binahDynamicServer);
	// B"H - Semantic search warmup: the e5 query worker takes ~12s to load its
	// model; without a boot-time warmup every process start leaves the first
	// semantic query to die on the 5s ready deadline (MULTILINGUAL_WORKER_WARMING).
	// Fire-and-forget, delayed so boot-critical work settles first; disable with
	// AWTSMOOS_WARM_SEMANTIC_SEARCH=0.
	if (process.env.AWTSMOOS_WARM_SEMANTIC_SEARCH !== "0") {
		setTimeout(() => {
			try {
				beginSemanticWarmup();
			} catch (error) {
				console.error('B"H semantic warmup start failed', error);
			}
		}, 15000).unref();
	}
	await startConfiguredVirtualSsh();
	const tiferesHttpServer = createHttpApplicationServer({
		dynamicServer: binahDynamicServer,
		wsServer: yesodSocketServer,
		requestHandlers: [
			runtimeHealth.handle,
			httpAdmission.handle,
			faviconIngress,
			createGlyphSessionIngress(),
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

/** Record process-start failure without swallowing its fatal status. */
function reportStartupRupture(error) {
	console.error('B"H - Startup rupture:', error);
	process.exitCode = 1;
}
revealAwtsmoosRuntime().catch(reportStartupRupture);
