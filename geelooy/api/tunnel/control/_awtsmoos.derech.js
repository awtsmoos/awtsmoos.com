//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H — Yaakov 2026-10-14: MINIMAL diagnostic version.
 * Testing if the 500 is caused by the route table.
 * If /test works, the issue is in the routes. If it still 500s, the issue is elsewhere.
 */
module.exports = {
  dynamicRoutes: async $i => {
    try {
      await $i.use("test", async () => {
        return { statusCode: 200, response: JSON.stringify({ BH: "B\"H", ok: true }) };
      });
      await $i.use("pairing/request", async () => {
        return {
          statusCode: 500,
          response: JSON.stringify({
            BH: "B\"H",
            error: { message: "Diagnostic: route table bypassed", code: "DIAGNOSTIC", statusCode: 500 }
          })
        };
      });
    } catch (err) {
      const stack = err && err.stack ? err.stack : String(err);
      console.error("B\"H MINIMAL DERECH ERROR:", stack);
      throw err;
    }
  }
};
