
// B"H

const deps = require("./deps.js");
const { btoa, atob } = require("./codecs.js");
const { initDb } = require("./initDb.js");
const { installAuth } = require("./authSetup.js");
const { loadLogKey } = require("./logKey.js");
const { createBodyReaders } = require("./bodyReaders.js");
const { createRuntimeDeps } = require("./runtimeDeps.js");
const { createPathState } = require("./pathState.js");
const { bootstrapRequest } = require("./requestBootstrap.js");

const awtsMoosification = "_awtsmoos.derech.js";

/**
 * B"H
 * Awtsmoos static/dynamic server.
 *
 * The old monolith is split, but the public class and behavior remain.
 */
class AwtsmoosStaticServer {
  constructor(directory, mail = null) {
    this.directory = (directory || __dirname) + "/";
    this.mainDir = deps.config.public || "geelooy";
    this.middleware = [];
    this.db = null;
    this.mail = mail;

    process.env.__awtsdir = this.directory;
    process.removeAllListeners("warning");
  }

  /**
   * B"H
   * Calls centralized AI helper.
   *
   * @param {Array} history Chat history.
   * @param {string} apiKey API key.
   * @param {string} model Model name.
   * @param {Function} onChunk Stream callback.
   * @returns {Promise<unknown>} AI result.
   */
  async callAi(history, apiKey, model, onChunk) {
    return await deps.awtsmoosAi(deps.fetch, history, apiKey, model, onChunk);
  }

  /**
   * B"H
   * Creates an async job in DosDB.
   *
   * @param {object} info Job info.
   * @returns {Promise<object>} Job id object.
   */
  async createJob(info) {
    if (!info.tasks || !Array.isArray(info.tasks) || !info.tasks.length) {
      throw new Error("Job creation requires a non-empty 'tasks' array.");
    }

    const jobId = `${info.description.replace(/\s+/g, "-").slice(0, 20)}-${Date.now()}`;

    const jobRecord = {
      jobId,
      status: "pending",
      description: info.description,
      tasks: info.tasks,
      createdAt: Date.now(),
      requestedBy: info.requestedBy || "system"
    };

    const result = await this.db.arrayAppend("/_system/jobs/taskQueue", jobRecord);

    if (result && result.error) {
      throw new Error("Failed to write job to the queue.");
    }

    return { jobId };
  }

  /**
   * B"H
   * Initializes config, db, auth, worker, and mail ingress.
   *
   * @returns {Promise<void>} Resolves when ready.
   */
  async init() {
    if (!deps.config) {
      console.log("NO config set!");
      return;
    }

    this.firebaseKey = await loadLogKey(deps);
    this.db = await initDb(deps, this.directory);

    if (this.ws) this.ws.db = this.db;

    try {
      deps.startTaskRunner(this.db);
    } catch (workerError) {
      console.error("CRITICAL: Failed to start cleanup worker!", workerError);
    }

    installAuth(this, deps, this.directory);

    if (this.mail) {
      this.mail.gotMail = deps.emailIngress.bind(this);
    }
  }

  /**
   * B"H
   * Adds middleware.
   *
   * @param {Function} fn Middleware.
   * @returns {void}
   */
  use(fn) {
    if (typeof fn === "function") this.middleware.push(fn);
  }

  /**
   * B"H
   * Runs middleware.
   *
   * @param {object} q Request.
   * @param {object} r Response.
   * @returns {Promise<void>} Resolves after middleware.
   */
  async doMiddleware(q, r) {
    await Promise.all(this.middleware.map(async fn => fn(q, r)));
  }

  /**
   * B"H
   * Handles one HTTP request.
   *
   * @param {object} request Incoming request.
   * @param {object} response Outgoing response.
   * @returns {Promise<unknown>} Route result.
   */
  async onRequest(request, response) {
    const cookies = typeof request.headers.cookie === "string"
      ? deps.Utils.parseCookies(request.headers.cookie)
      : {};

    const boot = bootstrapRequest({ request, response, cookies });
    if (!boot) return;

    await this.doMiddleware(request, response);

    const pathState = createPathState(
      deps,
      this.directory,
      this.mainDir,
      boot.originalPath
    );

    if (request.method === "GET" && request.headers["awtsmoos-file-status"]) {
      request.isAwtsmoosFileStatusRequest = true;
    }

    const readers = createBodyReaders({
      request,
      paramKinds: boot.paramKinds,
      querystring: deps.querystring,
      parseMultipartFormData: require("../multipartParser.js").parseMultipartFormData
    });

    return await this.runDynamicRoute({
      request,
      response,
      cookies,
      boot,
      pathState,
      readers
    });
  }

  /**
   * B"H
   * Builds route context and runs the Awtsmoos route engine.
   *
   * @param {object} x Runtime bundle.
   * @returns {Promise<unknown>} Route result.
   */
  async runDynamicRoute(x) {
    let templateObjectGenerator;

    const template = async (textContent, ob = {}, entire = false) => {
      const obj = await templateObjectGenerator.getTemplateObject(
        typeof ob === "object" ? ob : {}
      );

      return await deps.processTemplate(textContent, obj, entire);
    };

    const makeToken = (vl, ex = {}) => {
      try {
        return { success: deps.sodos.createToken(vl, this.secret, ex) };
      } catch (e) {
        return { error: e.stack };
      }
    };

    const dependencies = createRuntimeDeps({
      deps,
      server: this,
      ws: this.ws,
      mail: this.mail,
      request: x.request,
      response: x.response,
      cookies: x.cookies,
      paramKinds: x.boot.paramKinds,
      fullUrl: x.boot.fullUrl,
      originalPath: x.boot.originalPath,
      filePath: x.pathState.filePath,
      parentPath: x.pathState.serverPath,
      contentType: x.pathState.contentType,
      awtsMoosification,
      template,
      btoa,
      atob,
      getPostData: x.readers.getPostData,
      getPutData: x.readers.getPutData,
      getDeleteData: x.readers.getDeleteData,
      createJob: this.createJob.bind(this),
      makeToken,
      callAi: this.callAi.bind(this)
    });

    templateObjectGenerator = new deps.TemplateObjectGenerator(dependencies);

    const awtsRes = new deps.AwtsmoosResponse({
      templateObjectGenerator,
      ...templateObjectGenerator.dependencies
    });

    const ayz = new deps.Ayzarim({
      awtsRes,
      templateObjectGenerator,
      ...templateObjectGenerator.dependencies
    });

    templateObjectGenerator.fetchAwtsmoos = ayz.fetchAwtsmoos.bind(ayz);

    try {
      deps.doLogs({
        firebaseKey: this.firebaseKey,
        filePath: x.pathState.filePath,
        request: x.request
      });

      return await ayz.doEverything.bind(ayz)();
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = AwtsmoosStaticServer;
