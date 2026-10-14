//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H — Yaakov 2026-10-14: Diagnostic to find the broken route.
 * Tries to load the route table and reports the specific error.
 */
module.exports = {
  dynamicRoutes: async $i => {
    await $i.use("test", async () => {
      return { statusCode: 200, response: JSON.stringify({ BH: "B\"H", ok: true }) };
    });
    await $i.use("diagnose", async () => {
      try {
        const { routeTable } = require("./routes/table.js");
        const count = Object.keys(routeTable).length;
        // Try to verify each handler is a function
        const broken = [];
        for (const [path, handler] of Object.entries(routeTable)) {
          if (typeof handler !== "function") {
            broken.push(path + " (not a function: " + typeof handler + ")");
          }
        }
        return {
          statusCode: 200,
          response: JSON.stringify({
            BH: "B\"H",
            routeCount: count,
            brokenRoutes: broken,
            ok: broken.length === 0
          })
        };
      } catch (err) {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: {
              message: err.message,
              code: "DIAGNOSE_ERROR",
              statusCode: 500,
              stackTrace: err.stack
            }
          })
        };
      }
    });
  }
};
