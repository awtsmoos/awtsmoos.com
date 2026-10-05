//B"H
//Boruch Hashem
//Blessed is He
const assert = require("node:assert/strict");
const test = require("node:test");
const { routeTable } = require("../routes/table.js");
const { dynamicRoutes } = require("../_awtsmoos.derech.js");
const { normalizeDynamicReturn } = require("../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js");

// The Awtsmoos keeps the outer HTTP witness faithful to the inner authorization gate.
test("protected route preserves denied HTTP status through dynamic normalization", async () => {
 const saved = routeTable.me;
 const handlers = new Map();
 const response = { statusCode: 200, headersSent: false, setHeader() {} };
 const context = { response, request: { headers: {} }, async use(name, handler) { handlers.set(name, handler); } };
 await dynamicRoutes(context);
 const result = await handlers.get("me")({});
 const normalized = normalizeDynamicReturn(result);
 assert.equal(normalized.statusCode, 401);
 assert.equal(JSON.parse(normalized.body).error, "not_authenticated");
 assert.equal(routeTable.me, saved);
});
