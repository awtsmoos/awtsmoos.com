// B"H
const path = require("path");
const { buildBundleManifest } = require("./bundleManifest.js");
const { buildBundleZip } = require("./bundleWriter.js");
const { checkRateLimit } = require("./rateLimit.js");

/**
 * B"H
 * Chapter 401: The installer asked for a few compressed scrolls instead of a
 * thousand droplets. This route answers only for the tunnel-agent manifest path
 * and only when the explicit bundle flag is present.
 */
async function maybeSendBundle(context) {
  const params = getParams(context);
  if (!params || !params.bundle) return false;
  if (!isAgentManifest(context.filePath)) return false;
  try {
    if (String(params.bundle) === "manifest") return await sendBundleManifest(context);
    if (String(params.bundle) === "zip") return await sendBundleZip(context, params);
    return sendJson(context, 400, { ok: false, error: "unknown_bundle_mode" });
  } catch (error) {
    return sendJson(context, 500, { ok: false, error: error.message, stack: String(error.stack || "").split("\n").slice(0, 4) });
  }
}

async function sendBundleManifest(context) {
  const manifest = await buildBundleManifest({ fs: context.dependencies.fs, agentRoot: agentRoot(context), baseUrl: "/apps/tunnel/agent" });
  return sendJson(context, 200, manifest);
}

async function sendBundleZip(context, params) {
  const part = String(params.part || "core");
  const limit = checkRateLimit(clientKey(context), 0);
  if (!limit.ok) return sendJson(context, limit.statusCode, limit);
  const built = await buildBundleZip({ fs: context.dependencies.fs, agentRoot: agentRoot(context), part });
  const byteLimit = checkRateLimit(clientKey(context), built.zip.length);
  if (!byteLimit.ok) return sendJson(context, byteLimit.statusCode, byteLimit);
  const response = context.dependencies.response;
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/zip");
  response.setHeader("Content-Disposition", `attachment; filename="awtsmoos-agent-${part}.zip"`);
  response.setHeader("X-Awtsmoos-Bundle-Part", part);
  response.setHeader("X-Awtsmoos-Bundle-Files", String(built.files));
  response.setHeader("X-Awtsmoos-Bundle-Sha256", built.sha256);
  response.end(built.zip);
  return true;
}

function sendJson(context, statusCode, body) {
  const response = context.dependencies.response;
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
  return true;
}

function getParams(context) {
  const kinds = context.dependencies.paramKinds;
  const parsed = kinds && kinds.GET && typeof kinds.GET === "object" ? kinds.GET : {};
  const legacy = context.dependencies.request && typeof context.dependencies.request.yeser === "object" ? context.dependencies.request.yeser : {};
  return Object.assign({}, legacy || {}, parsed || {});
}

function isAgentManifest(filePath) {
  return String(filePath || "").replace(/\\/g, "/").endsWith("/apps/tunnel/agent/manifest.txt");
}

function agentRoot(context) { return path.dirname(context.filePath); }
function clientKey(context) { return context.dependencies.request?.socket?.remoteAddress || context.dependencies.request?.headers?.["x-forwarded-for"] || "anon"; }

module.exports = { maybeSendBundle, isAgentManifest, agentRoot };
