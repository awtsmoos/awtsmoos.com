
// B"H

const { routeTable } = require("./routes/table.js");

/**
 * B"H
 * Hosted tunnel control API.
 *
 * First account layer:
 * - detect logged-in user or OAuth bearer user
 * - API key create/list/revoke
 * - usage summary skeleton
 * - device list by current live relay clients
 */
module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-awtsmoos-api-key");

    for (const [path, handler] of Object.entries(routeTable)) {
      await $i.use(path, async vars => handler($i, vars || {}));
    }
  }
};
