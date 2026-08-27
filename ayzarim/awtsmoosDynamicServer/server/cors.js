
// B"H
// Boruch Hashem
// Blessed is He

const CODE_RUNTIME_ROOT = "/apps/code";

/**
 * Applies cross-origin and isolation headers used by the dynamic server.
 *
 * Awtsmoos Code uses SharedArrayBuffer-backed synchronous worker IPC for its
 * browser Node runtime. That primitive is exposed only inside a cross-origin
 * isolated browsing context. The `credentialless` embedder policy keeps normal
 * CORS-enabled package and provider requests usable without granting ambient
 * credentials to foreign subresources.
 *
 * @param {object} request Incoming request.
 * @param {object} response Outgoing response.
 * @returns {void}
 */
function applyCors(request, response) {
  const origin = request.headers?.origin;
  const isolateCodeRuntime = isCodeRuntimeRequest(request);

  response.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, DELETE"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, authorization, x-awtsmoos-api-key, awtsmoos-file-status"
  );
  response.setHeader("Access-Control-Allow-Origin", origin || "*");
  response.setHeader(
    "Cross-Origin-Embedder-Policy",
    isolateCodeRuntime ? "credentialless" : "unsafe-none"
  );
  response.setHeader(
    "Cross-Origin-Opener-Policy",
    isolateCodeRuntime ? "same-origin" : "unsafe-none"
  );
  response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
}

/**
 * Determines whether a request belongs to the top-level Code runtime.
 *
 * @param {object} request Incoming request.
 * @returns {boolean} Whether Node worker isolation is required.
 */
function isCodeRuntimeRequest(request) {
  try {
    const pathname = new URL(
      String(request?.url || "/"),
      "https://awtsmoos.invalid"
    ).pathname.replace(/\/+$/, "");
    return pathname === CODE_RUNTIME_ROOT ||
      pathname.startsWith(`${CODE_RUNTIME_ROOT}/`);
  } catch {
    return false;
  }
}

/**
 * Ends OPTIONS preflight requests.
 *
 * @param {object} request Incoming request.
 * @param {object} response Outgoing response.
 * @returns {boolean} Whether the request was ended.
 */
function handleOptions(request, response) {
  if (request.method !== "OPTIONS") return false;
  response.writeHead(204);
  response.end();
  return true;
}

module.exports = {
  applyCors,
  handleOptions,
  isCodeRuntimeRequest
};
