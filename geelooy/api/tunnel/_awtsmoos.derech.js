
// B"H
// /api/tunnel

const { currentIdentity } = require("./control/core/auth.js");
const Authorization = require("./control/core/tunnelSecurity/authorization.js");
const FsPolicy = require("./control/routes/protectedFsPolicy.js");

/**
 * B"H
 * Decodes base64 UTF-8 text.
 *
 * @param {string} value Base64 text.
 * @returns {string} Decoded string.
 */
function from64(value) {
  if (!value) return "";
  return Buffer.from(String(value), "base64").toString("utf8");
}

/**
 * B"H
 * Decodes base64 JSON safely.
 *
 * @param {string} value Base64 JSON.
 * @param {*} fallback Fallback value.
 * @returns {*} Parsed JSON or fallback.
 */
function jsonFrom64(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(from64(value));
  } catch (e) {
    return fallback;
  }
}

/**
 * B"H
 * Parses the current request URL.
 *
 * @param {object} request Node request.
 * @returns {URL} Parsed URL.
 */
function getUrl(request) {
  return new URL(request.url, "https://awtsmoos.com");
}

/**
 * B"H
 * Builds a JSON dynamic response.
 *
 * @param {object} obj Response object.
 * @returns {object} Dynamic response packet.
 */
function sendJson(obj) {
  return {
    mimeType: "application/json",
    response: JSON.stringify(obj, null, 2)
  };
}

/**
 * B"H
 * Reads compact filesystem payload from GET params.
 *
 * Supported:
 * action=list|tree|read|md|bulk|write|bulkWrite
 * p=path
 * paths64=base64(JSON array)
 * content64=base64(text)
 * files64=base64(JSON object like {"file.js":"content"})
 * writes64=base64(JSON array like [{"path":"file.js","content":"..."}])
 *
 * @param {URL} url Parsed URL.
 * @returns {object} Tunnel filesystem payload.
 */
function buildFsPayload(url) {
  const action = url.searchParams.get("action") || "list";
  const p = url.searchParams.get("p") || url.searchParams.get("path") || ".";
  const depth = Number(url.searchParams.get("depth") || 2);
  const limit = Number(url.searchParams.get("limit") || 150);
  const maxChars = Number(url.searchParams.get("maxChars") || 12000);

  return {
    kind: "fs",
    action,
    path: p,
    paths: jsonFrom64(url.searchParams.get("paths64"), []),
    files: jsonFrom64(url.searchParams.get("files64"), null),
    writes: jsonFrom64(url.searchParams.get("writes64"), null),
    depth,
    limit,
    maxChars,
    content: from64(url.searchParams.get("content64"))
  };
}

/** Resolves an old route name into a verified account-owned relay destination. */
function authorizeRelay(info, tunnelReference, permission) {
  const identity = currentIdentity(info);
  if (!identity.ok) return { ok: false, error: "not_authenticated", status: 401 };
  const authorized = Authorization.authorize(
    identity.accountId,
    tunnelReference,
    permission
  );
  if (!authorized.ok) return { ok: false, error: "tunnel_not_found", status: 404 };
  return {
    ok: true,
    ownerAccountId: authorized.binding.ownerAccountId,
    tunnelName: authorized.binding.tunnelName
  };
}

module.exports = {
  dynamicRoutes: async info => {
    const { request, response, ws } = info;

    info.setHeader("Access-Control-Allow-Origin", "*");

    await info.use("status", async () => {
      return sendJson({
        BH: "B\"H",
        ok: true,
        tunnelSystem: true,
        connectedSockets: ws?.clients?.size || 0,
        tunnels: ws?.tunnels ? [...ws.tunnels.keys()] : []
      });
    });

    await info.use("clients", async () => {
      const clients = [];

      if (ws?.clients) {
        for (const client of ws.clients) {
          clients.push({
            id: client.id,
            aliasId: client.aliasId,
            tunnelName: client.tunnelName || null,
            isTunnel: !!client.isTunnel,
            isAlive: client.isAlive,
            root: client.root || null,
            allowWrite: !!client.allowWrite,
            deviceName: client.deviceName || null
          });
        }
      }

      return sendJson({
        BH: "B\"H",
        clients
      });
    });

    await info.use("request/:tunnelName", async vars => {
      try {
        const authority = authorizeRelay(info, vars.tunnelName, "tunnel.preview");
        if (!authority.ok) {
          response.statusCode = authority.status;
          return sendJson(authority);
        }
        const url = getUrl(request);
        const tunnelUrl = url.searchParams.get("url") || "/";

        const result = await ws.sendTunnelRequest(
          authority.ownerAccountId,
          authority.tunnelName,
          {
          kind: "http",
          method: request.method,
          url: tunnelUrl,
          headers: request.headers,
          body: null
          }
        );

        response.statusCode = result.status || 200;

        if (result.headers) {
          for (const [k, v] of Object.entries(result.headers)) {
            try {
              response.setHeader(k, v);
            } catch {}
          }
        }

        return {
          response: result.body
            ? Buffer.from(result.body, "base64")
            : ""
        };
      } catch (e) {
        return sendJson({
          error: e.message,
          stack: e.stack
        });
      }
    });

    await info.use("fs/:tunnelName", async vars => {
      try {
        const url = getUrl(request);
        const payload = buildFsPayload(url);
        const authority = authorizeRelay(
          info,
          vars.tunnelName,
          FsPolicy.requiredPermission(payload.action)
        );
        if (!authority.ok) {
          response.statusCode = authority.status;
          return sendJson(authority);
        }

        const result = await ws.sendTunnelRequest(
          authority.ownerAccountId,
          authority.tunnelName,
          payload
        );

        if (result.status) {
          response.statusCode = result.status;
        }

        if (result.mimeType) {
          try {
            response.setHeader("Content-Type", result.mimeType);
          } catch {}
        }

        if (result.raw64) {
          return {
            response: Buffer.from(result.raw64, "base64")
          };
        }

        return sendJson(result);
      } catch (e) {
        return sendJson({
          error: e.message,
          stack: e.stack
        });
      }
    });
  }
};
