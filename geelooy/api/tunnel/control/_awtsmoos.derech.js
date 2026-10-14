//B"H
//Boruch Hashem
//Blessed is He

const { routeTable } = require("./routes/table.js");

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
    // B"H — Yaakov 2026-10-14 STANDING RULE: All 500 errors must show full stack trace.
    // Wrap route registration to log the actual exception instead of the generic
    // "actual error in route computation!" message.
    try {
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
      // B"H — Yaakov 2026-10-14: Log full stack trace for 500 errors.
      console.error("B\"H CONTROL API 500 STACK TRACE:", err && err.stack ? err.stack : err);
      throw err;
    }
  }
};
