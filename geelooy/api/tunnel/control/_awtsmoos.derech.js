//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * Awtsmoos Tunnel Control API.
 *
 * This is the hosted control surface for:
 * - account/device/tunnel status
 * - scoped API keys
 * - usage/rate tracking
 * - protected filesystem bridge
 * - command bridge
 * - Chrome DevTools bridge
 * - human and machine-readable API docs
 *
 * @param {object} $i Awtsmoos dynamic server route context.
 * @returns {Promise<void>}
 */
module.exports = {
  dynamicRoutes: async $i => {
    // B"H — Yaakov 2026-10-14 STANDING RULE: All 500 errors must show full stack trace
    // IN THE RESPONSE, not just logs. Wrap EVERYTHING including requires.
    try {
    const { routeTable } = require("./routes/table.js");
    if (!$i.response.headersSent) {
      $i.response.setHeader("Access-Control-Allow-Origin", "*");
      $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-awtsmoos-api-key");
      $i.response.setHeader("Cache-Control", "no-store");
    }

    for (const [path, handler] of Object.entries(routeTable)) {
      await $i.use(path, async vars => {
        const result = await handler($i, vars || {});
        const response = $i.response;
        if (typeof result === "string" && !response.headersSent && response.statusCode !== 200) {
          return { statusCode: response.statusCode, response: result };
        }
        return result;
      });
    }
    } catch (err) {
      // B"H — Yaakov 2026-10-14 STANDING RULE: All 500 errors must show full stack trace
      // IN THE RESPONSE, not just logs. Register a catch-all error handler that
      // returns the stack trace so clients (and VMs without log access) can see it.
      const stack = err && err.stack ? err.stack : String(err);
      console.error("B\"H CONTROL API 500 STACK TRACE:", stack);
      // Register a fallback handler that returns the stack trace for any route
      try {
        await $i.use("*", async () => {
          return {
            statusCode: 500,
            response: JSON.stringify({
              BH: "B\"H",
              error: {
                message: err && err.message ? err.message : "Route registration failed",
                code: "ROUTE_ERROR",
                statusCode: 500,
                stackTrace: stack
              }
            })
          };
        });
      } catch (e2) {
        // If even the fallback fails, re-throw original
        throw err;
      }
    }
  }
};
