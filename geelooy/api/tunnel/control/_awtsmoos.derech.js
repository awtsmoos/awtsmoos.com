//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H — Yaakov 2026-10-14: Minimal pairing API.
 * The full 107-route table is broken. This implements ONLY the pairing routes
 * the installer needs, directly. "At all costs" — a working pairing API.
 * B"H — 2026-10-14: Added pairing/state (read-only poll) and my-device.
 */
module.exports = {
  dynamicRoutes: async $i => {
    // Test endpoint
    await $i.use("test", async () => {
      return { statusCode: 200, response: JSON.stringify({ BH: "B\"H", ok: true }) };
    });

    // Pairing routes - loaded lazily to isolate errors
    await $i.use("pairing/request", async (vars) => {
      try {
        const { pairingRequest } = require("./routes/pairing.js");
        return await pairingRequest($i, vars || {});
      } catch (err) {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: { message: err.message, code: "PAIRING_ERROR", statusCode: 500, stack: err.stack }
          })
        };
      }
    });

    await $i.use("pairing/status", async (vars) => {
      try {
        const { pairingStatus } = require("./routes/pairing.js");
        return await pairingStatus($i, vars || {});
      } catch (err) {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: { message: err.message, code: "PAIRING_ERROR", statusCode: 500 }
          })
        };
      }
    });

    // B"H — 2026-10-14: Read-only pairing state poll. Never consumes.
    // The installer polls this until approved, then calls pairing/status once.
    await $i.use("pairing/state", async (vars) => {
      try {
        const { pairingState } = require("./routes/pairing.js");
        return await pairingState($i, vars || {});
      } catch (err) {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: { message: err.message, code: "PAIRING_ERROR", statusCode: 500, stack: err.stack }
          })
        };
      }
    });

    await $i.use("pairing/page", async (vars) => {
      try {
        // B"H — Yaakov 2026-10-14: Clear require cache so file changes take effect
        // WITHOUT server restart (fix deploy system).
        const pagePath = require.resolve("./routes/pairingPage.js");
        delete require.cache[pagePath];
        const { pairingPageHtml } = require("./routes/pairingPage.js");
        // B"H — Yaakov 2026-10-14: Get query params from multiple possible locations.
        // The framework may put them in vars.query, $i.query, or the URL.
        let query = {};
        if (vars && vars.query) query = vars.query;
        else if ($i && $i.query) query = $i.query;
        else if (vars && typeof vars === "object") {
          // vars might BE the query object directly
          if (vars.pairingCode || vars.pairingId) query = vars;
        }
        // Fallback: parse from URL if available
        if (!query.pairingCode && $i && $i.url) {
          try {
            const urlObj = new URL($i.url, "https://awtsmoos.com");
            query.pairingCode = urlObj.searchParams.get("pairingCode") || "";
            query.pairingId = urlObj.searchParams.get("pairingId") || "";
          } catch (e) {}
        }
        if (!query.pairingCode && $i && $i.request && $i.request.url) {
          try {
            const urlObj = new URL($i.request.url, "https://awtsmoos.com");
            query.pairingCode = urlObj.searchParams.get("pairingCode") || "";
            query.pairingId = urlObj.searchParams.get("pairingId") || "";
          } catch (e) {}
        }
        const html = pairingPageHtml({
          pairingCode: query.pairingCode || query.code || "",
          pairingId: query.pairingId || "",
          returnPath: ""
        });
        return {
          statusCode: 200,
          response: html,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            // B"H — Yaakov 2026-10-14: Fix cache busting. Never cache the pairing page.
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        };
      } catch (err) {
        // B"H — Yaakov 2026-10-14 STANDING RULE: Show full stack trace in response.
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: {
              message: err.message,
              code: "PAIRING_ERROR",
              statusCode: 500,
              stackTrace: err.stack
            }
          })
        };
      }
    });

    await $i.use("pairing/approve", async (vars) => {
      try {
        const { pairingApprove } = require("./routes/pairing.js");
        return await pairingApprove($i, vars || {});
      } catch (err) {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: { message: err.message, code: "PAIRING_ERROR", statusCode: 500 }
          })
        };
      }
    });

    // B"H — 2026-10-14: Device discovery for tunnel detection.
    await $i.use("my-device", async (vars) => {
      try {
        const { myDevice } = require("./routes/myDevice.js");
        return await myDevice($i, vars || {});
      } catch (err) {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: { message: err.message, code: "DEVICE_ERROR", statusCode: 500, stack: err.stack }
          })
        };
      }
    });

    // Restore the authenticated native and Virtual OS action doors. These are
    // lazy so an unrelated control route cannot prevent pairing at startup.
    // The static Virtual OS path is registered before the dynamic native path.
    await $i.use("fs/awtsmoos-os", async (vars) => {
      const { osFs } = require("./routes/osFs.js");
      return osFs($i, vars || {});
    });
    await $i.use("fs/:tunnelName", async (vars) => {
      const { protectedFs } = require("./routes/protectedFs.js");
      return protectedFs($i, vars || {});
    });
    await $i.use("devices", async (vars) => {
      const { devices } = require("./routes/devices.js");
      return devices($i, vars || {});
    });
    await $i.use("docs", async (vars) => {
      const { docsHtml } = require("./routes/docsHtml.js");
      return docsHtml($i, vars || {});
    });
    await $i.use("docs.json", async (vars) => {
      const { docsJson } = require("./routes/docsJson.js");
      return docsJson($i, vars || {});
    });
    await $i.use("openapi", async (vars) => {
      const { openApi } = require("./routes/openApi.js");
      return openApi($i, vars || {});
    });

    // B"H — 2026-10-15: Simple tunnel fallback (temporary).
    // NOTE: Do NOT clear require cache here — the in-memory store must persist.
    await $i.use("simple/cmd", async (vars) => {
      const { queueCommand } = require("./routes/simpleTunnel.js");
      return await queueCommand($i, vars || {});
    });
    await $i.use("simple/poll", async (vars) => {
      const { pollCommand } = require("./routes/simpleTunnel.js");
      return await pollCommand($i, vars || {});
    });
    await $i.use("simple/result", async (vars) => {
      // POST = agent posts result, GET = client gets result
      const { postResult, getResult } = require("./routes/simpleTunnel.js");
      const method = ($i.request?.method || $i.method || "GET").toUpperCase();
      if (method === "POST") return await postResult($i, vars || {});
      return await getResult($i, vars || {});
    });
    // B"H — Temporary setup (no auth). Remove after secret is set.
    await $i.use("simple/setup", async (vars) => {
      const { setup } = require("./routes/simpleTunnel.js");
      return await setup($i, vars || {});
    });
    // B"H — Approval lane endpoints (Yaakov 2026-10-15)
    await $i.use("simple/request", async (vars) => {
      const { requestApproval } = require("./routes/simpleTunnel.js");
      return await requestApproval($i, vars || {});
    });
    await $i.use("simple/approved", async (vars) => {
      const { checkApproval } = require("./routes/simpleTunnel.js");
      return await checkApproval($i, vars || {});
    });
    // B"H — Simple lanes file server (Yaakov 2026-10-15)
    // Serves agent files for the installer: /api/tunnel/control/lanes/simple/:filename
    await $i.use("lanes/simple/:filename", async (vars) => {
      const { serveLaneFile } = require("./routes/simpleLanes.js");
      return await serveLaneFile($i, vars || {});
    });
    // The emergency pairing/control routes above retain their tested behavior;
    // every other guarded production route comes from the canonical route table.
    await mountRemainingGuardedRoutes($i);
  }
};

/**
 * B"H — Restore the canonical 107-route surface without duplicating emergency
 * pairing and runtime command doors. Each handler keeps the real request context.
 */
const EXPLICIT_ROUTES = new Set([
  "pairing/request", "pairing/status", "pairing/state", "pairing/page", "pairing/approve",
  "my-device", "devices", "fs/awtsmoos-os", "fs/:tunnelName", "docs", "docs.json", "openapi"
]);
async function mountRemainingGuardedRoutes($i) {
  const { routeTable } = require("./routes/table.js");
  for (const [route, handler] of Object.entries(routeTable)) {
    if (EXPLICIT_ROUTES.has(route)) continue;
    if (typeof handler !== "function") throw Error(`tunnel_route_invalid_handler:${route}`);
    await $i.use(route, async vars => {
      const result = await handler($i, vars || {});
      // String JSON responses are normalized to HTTP 200 by the dynamic server
      // unless their validated HTTP status accompanies them in a wrapper.
      const statusCode = Number($i.response?.statusCode);
      return typeof result === "string" && Number.isInteger(statusCode) &&
        statusCode >= 100 && statusCode <= 599 && statusCode !== 200
        ? { statusCode, response: result }
        : result;
    });
  }
}
