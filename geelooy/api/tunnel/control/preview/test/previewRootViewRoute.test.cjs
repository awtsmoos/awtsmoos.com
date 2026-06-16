// B"H
const assert = require("assert");
const { createPreview } = require("../previewStore.js");
const rootRoute = require("../../../../../view/_awtsmoos.derech.js");
const { renderPreview } = require("../previewRenderer.js");

const proxy = createPreview("asdf", {
  kind: "proxy",
  title: "Local 8080",
  tunnelName: "awt-test",
  targetVessel: "awt-test",
  url: "http://127.0.0.1:8080/",
  visibility: "public",
  createdBy: "user",
  ttlSeconds: 120
});
assert.strictEqual(proxy.ok, true);
assert(proxy.viewUrl.includes("/view/"));
const rendered = renderPreview(proxy);
assert.strictEqual(rendered.mimeType, "text/html; charset=utf-8");
assert(rendered.response.includes("<iframe"));
assert(rendered.response.includes("/api/tunnel/control/preview/awt-test"));

const calls = [];
const fake = {
  request: { headers: {}, user: { info: { userId: "asdf" } } },
  response: { headersSent: false, setHeader() {} },
  use(route, handler) {
    calls.push(route);
    return Promise.resolve(route.includes("raw") || route.includes("ws") ? null : handler({ previewId: proxy.id }));
  }
};
rootRoute.dynamicRoutes(fake).then(() => {
  assert(calls.includes(":previewId"));
  assert(calls.includes(":previewId/raw"));
  assert(calls.includes(":previewId/ws"));
  console.log("BHY preview root view route tests passed");
}).catch(error => { console.error(error); process.exit(1); });
