
// B"H

const { routeTable } = require("./routes/table.js");

function cleanRouteName(name) {
  return String(name || "")
    .split("?")[0]
    .split("#")[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

async function callRoute($i, name, vars) {
  const clean = cleanRouteName(name);
  const handler = routeTable[clean] || routeTable[""];

  if (!handler) {
    return {
      statusCode: 404,
      mimeType: "application/json; charset=utf-8",
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

    /*
     * B"H
     * IMPORTANT:
     * Do not register authorize, /authorize, :route, /:route all together.
     * The Awtsmoos dynamic server evaluates every $i.use call, so duplicate
     * matching routes can run the same OAuth logic multiple times.
     *
     * These two are enough with the improved route matcher:
     * - "" for /api/oauth
     * - ":route" for /api/oauth/authorize, /token, /me, etc.
     */
    await $i.use("", async vars => callRoute($i, "", vars));
    await $i.use(":route", async vars => callRoute($i, vars.route, vars));
  }
};
