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

test("explicit hosted Virtual OS route carries unauthorized 401 across dynamic normalization", async () => {
 const handlers=new Map();
 const response={ statusCode:200, headersSent:false, setHeader(){} };
 const context={ response, request:{method:"POST",headers:{},body:{action:"gitClone",url:"https://github.com/octocat/Hello-World",destination:"project/repos/demo"}}, async use(name,handler){ handlers.set(name,handler); } };
 await dynamicRoutes(context);
 const route=await handlers.get("fs/awtsmoos-os")({});
 const normalized=normalizeDynamicReturn(route);
 assert.equal(normalized.statusCode,401);
 const body=JSON.parse(normalized.body);
 assert.equal(body.error,"not_authenticated");
 assert.equal(body.ok,false);
});
