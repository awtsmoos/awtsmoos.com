
// B"H

const { routeTable } = require("./routes/table.js");

async function callRoute($i, name, vars) {
  const clean = String(name || "")
    .split("?")[0]
    .split("#")[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  const handler = routeTable[clean] || routeTable[""];

  if (!handler) {
    return {
      mimeType: "application/json; charset=utf-8",
      response: {
        BH: "B\"H",
        ok: false,
        error: "oauth_route_not_found",
        route: clean,
        available: Object.keys(routeTable)
      }
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

    await $i.use(":route", async vars => callRoute($i, vars.route, vars));
    await $i.use("/:route", async vars => callRoute($i, vars.route, vars));

    await $i.use("authorize", async vars => callRoute($i, "authorize", vars));
    await $i.use("/authorize", async vars => callRoute($i, "authorize", vars));

    await $i.use("token", async vars => callRoute($i, "token", vars));
    await $i.use("/token", async vars => callRoute($i, "token", vars));

    await $i.use("me", async vars => callRoute($i, "me", vars));
    await $i.use("/me", async vars => callRoute($i, "me", vars));

    await $i.use("clients", async vars => callRoute($i, "clients", vars));
    await $i.use("/clients", async vars => callRoute($i, "clients", vars));

    await $i.use("logout", async vars => callRoute($i, "logout", vars));
    await $i.use("/logout", async vars => callRoute($i, "logout", vars));
  }
};
