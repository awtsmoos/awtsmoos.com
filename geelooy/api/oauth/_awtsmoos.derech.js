
// B"H

const { routeTable } = require("./routes/table.js");

/**
 * B"H
 * OAuth entrance for the Awtsmoos account system.
 *
 * This file is intentionally tiny. It is the front gate only.
 * The inner chambers live in routes, core, tools, views, and data.
 *
 * @param {object} $i Awtsmoos dynamic route context.
 * @returns {Promise<void>} Registers the OAuth route table.
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
