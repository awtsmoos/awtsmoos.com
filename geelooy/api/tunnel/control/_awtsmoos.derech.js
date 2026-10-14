//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H — Yaakov 2026-10-14: Minimal pairing API.
 * The full 107-route table is broken. This implements ONLY the 4 pairing routes
 * the installer needs, directly. "At all costs" — a working pairing API.
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
  }
};
