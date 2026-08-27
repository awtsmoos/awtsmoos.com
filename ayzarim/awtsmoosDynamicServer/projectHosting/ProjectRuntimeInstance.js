//B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const AwtsmoosStaticServer = require("../index.js");
const { ProjectRuntimeEvents } = require("./ProjectRuntimeEvents.js");
const { finalizeRuntimeFailure, safeCode } = require("./projectRuntimeFailure.js");
const { close, listen } = require("./projectRuntimeHttpLifecycle.js");
const { observeRuntimeRequest } = require("./projectRuntimeRequestObserver.js");

/**
 * @file One managed HTTP vessel around the existing Awtsmoos dynamic route engine.
 * @description
 * The Awtsmoos gives one trusted project root one living listener and a bounded memory of its motion;
 * Awtsmoos.com records lifecycle and sanitized request truth without revealing roots, URLs, bodies, cookies, messages, stacks, or arbitrary process speech.
 */
class ProjectRuntimeInstance {
	constructor(options) {
		this.projectId = options.projectId;
		this.root = options.resolvedRoot;
		this.host = options.host || "127.0.0.1";
		this.port = Number(options.port || 0);
		this.engineFactory = options.engineFactory || (root => new AwtsmoosStaticServer(root));
		this.httpFactory = options.httpFactory || (handler => http.createServer(handler));
		this.events = options.events || new ProjectRuntimeEvents(options.eventLimit);
		this.logger = options.logger || console;
		this.engine = null;
		this.server = null;
		this.startedAt = null;
		this.lastError = null;
	}

	async start() {
		if (this.server) return this.status();
		this.events.push("starting");
		try {
			this.engine = this.engineFactory(this.root);
			await this.engine.init();
			this.server = this.httpFactory((request, response) => {
				void observeRuntimeRequest({
					engine: this.engine,
					request,
					response,
					events: this.events,
					onFailure: (failedResponse, error, details) => {
						this.failResponse(failedResponse, error, details);
					}
				});
			});
			await listen(this.server, this.port, this.host);
			this.startedAt = Date.now();
			this.lastError = null;
			this.events.push("started", { port: this.status().port });
			return this.status();
		} catch (error) {
			this.recordError("start_failed", error);
			this.server = null;
			this.engine = null;
			throw error;
		}
	}

	async stop() {
		if (!this.server) return this.status();
		await close(this.server);
		this.server = null;
		this.engine = null;
		this.events.push("stopped");
		return this.status();
	}

	status() {
		const address = this.server?.address?.();
		return Object.freeze({
			projectId: this.projectId,
			root: this.root,
			running: Boolean(this.server),
			host: this.host,
			port: typeof address === "object" && address ? address.port : null,
			startedAt: this.startedAt,
			lastError: this.lastError,
			eventCount: this.events.list().length
		});
	}

	activity() {
		return this.events.list();
	}

	failResponse(response, error, details = {}) {
		const code = safeCode(error?.code);
		const statusCode = finalizeRuntimeFailure(response, code, this.logger);
		this.recordError("request_failed", { code }, {
			...details,
			statusCode
		});
	}

	recordError(type, error, details = {}) {
		const code = safeCode(error?.code);
		this.lastError = Object.freeze({ code, time: Date.now() });
		this.events.push(type, { ...details, code });
	}
}

module.exports = { ProjectRuntimeInstance };
