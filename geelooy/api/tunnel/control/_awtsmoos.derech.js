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
        const { pairingPageHtml } = require("./routes/pairingPage.js");
        const query = (vars && vars.query) || {};
        // B"H — Yaakov 2026-10-14: pairingPageHtml is a function, not a route handler.
        // Call it with the pairing code from query params.
        const html = pairingPageHtml({
          pairingCode: query.pairingCode || query.code || "",
          pairingId: query.pairingId || "",
          returnPath: ""
        });
        return {
          statusCode: 200,
          response: html,
          headers: { "Content-Type": "text/html; charset=utf-8" }
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
