
// B"H

const { routeTable } = require("./routes/table.js");

/**
 * B"H
 * The OAuth chamber opens like a narrow gate of fire.
 * Every route is not hardcoded chaos but a vessel in a table,
 * each one receiving the request like sparks drawn into order.
 *
 * @param {object} $i Awtsmoos dynamic server route context.
 * @returns {Promise<void>} Registers every OAuth route.
 */
module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    for (const [path, handler] of Object.entries(routeTable)) {
      await $i.use(path, async vars => handler($i, vars || {}));
    }
  }
};
