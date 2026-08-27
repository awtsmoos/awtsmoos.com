
// B"H

const { routeTable } = require("./routes/table.js");

module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    $i.response.setHeader("Cache-Control", "no-store");

    for (const [path, handler] of Object.entries(routeTable)) {
      await $i.use(path, async vars => handler($i, vars || {}));
    }
  }
};
