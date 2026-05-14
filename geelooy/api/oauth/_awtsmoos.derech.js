
// B"H

const { routeTable } = require("./routes/table.js");

async function callRoute($i, name, vars) {
  const clean = String(name || "").replace(/^\/+/, "").replace(/\/+$/, "");
  const handler = routeTable[clean] || routeTable[""];

  if (!handler) {
    return {
      mimeType: "application/json",
      response: JSON.stringify({
        BH: "B\"H",
        ok: false,
        error: "oauth_route_not_found",
        route: clean,
        available: Object.keys(routeTable)
      }, null, 2)
    };
  }

  return await handler($i, vars || {});
}

module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    $i.response.setHeader("Cache-Control", "no-store");

    await $i.use("", async vars => callRoute($i, "", vars));
    await $i.use("/", async vars => callRoute($i, "", vars));

    await $i.use(":route", async vars => {
      return await callRoute($i, vars.route, vars);
    });

    await $i.use("/:route", async vars => {
      return await callRoute($i, vars.route, vars);
    });
  }
};
