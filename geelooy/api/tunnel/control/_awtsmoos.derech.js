
// B"H

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
    if (!$i.response.headersSent) {
      $i.response.setHeader("Access-Control-Allow-Origin", "*");
      $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-awtsmoos-api-key");
      $i.response.setHeader("Cache-Control", "no-store");
    }

    for (const [path, handler] of Object.entries(routeTable)) {
      await $i.use(path, async vars => handler($i, vars || {}));
    }
  }
};
