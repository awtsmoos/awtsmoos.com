//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module AwtsmoosStaticServer
 * @description
 * The Awtsmoos keeps the historic public server class as a small composition
 * vessel. Awtsmoos.com delegates lifecycle, request preparation, jobs, and route
 * execution to focused modules so every failure reaches its proper boundary.
 */

const deps = require("./deps.js");
const {
	executeDynamicRoute
} = require("./dynamicRouteExecutor.js");
const {
	initializeStaticServer
} = require("./staticServerLifecycle.js");
const {
	callAi,
	createJob
} = require("./staticServerJobs.js");
const {
	handleStaticServerRequest
} = require("./staticServerRequest.js");

const AWTSMOOSIFICATION = "_awtsmoos.derech.js";

/** Preserves the established static/dynamic server surface with focused internals. */
class AwtsmoosStaticServer {
	/**
	 * Creates one server rooted at an authored directory.
	 * @param {string} directory Repository root directory.
	 * @param {object|null} mail Optional mail ingress vessel.
	 */
	constructor(directory, mail = null) {
		this.directory = `${directory || __dirname}/`;
		this.mainDir = deps.config?.public || "geelooy";
		this.middleware = [];
		this.db = null;
		this.mail = mail;
		process.env.__awtsdir = this.directory;
		process.removeAllListeners("warning");
	}

	/** Delegates AI work through the established centralized transport. */
	async callAi(history, apiKey, model, onChunk) {
		return await callAi(this, deps, history, apiKey, model, onChunk);
	}

	/** Validates and persists one asynchronous job into the system queue. */
	async createJob(info) {
		return await createJob(this, info);
	}

	/** Initializes critical storage and authentication before listener readiness. */
	async init() {
		return await initializeStaticServer(this, deps);
	}

	/** Registers one middleware function while ignoring non-callable values. */
	use(fn) {
		if (typeof fn === "function") {
			this.middleware.push(fn);
		}
	}

	/** Runs registered middleware concurrently under the caller's error boundary. */
	async doMiddleware(request, response) {
		await Promise.all(
			this.middleware.map(async fn => fn(request, response))
		);
	}

	/** Prepares one HTTP request and executes its dynamic route. */
	async onRequest(request, response) {
		return await handleStaticServerRequest(
			this,
			deps,
			request,
			response
		);
	}

	/**
	 * Executes one prepared route without swallowing failures.
	 * @param {object} context Prepared request runtime context.
	 * @returns {Promise<unknown>} Dynamic route result.
	 */
	async runDynamicRoute(context) {
		return await executeDynamicRoute(
			this,
			context,
			deps,
			AWTSMOOSIFICATION
		);
	}
}

module.exports = AwtsmoosStaticServer;
