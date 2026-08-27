// B"H
const assert = require("assert");
const { createPreview } = require("../previewStore.js");
const rootRoute = require("../../../../../view/_awtsmoos.derech.js");
const { renderPreview } = require("../previewRenderer.js");
const { rewriteHtmlForProxy } = require("../../routes/view.js");

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
assert(rendered.response.includes(`/view/${proxy.id}/proxy`));

const rewritten = rewriteHtmlForProxy(
  '<link href="/app.css"><script src="./main.js"></script><img src="data:image/png;base64,abc">',
  "http://127.0.0.1:8080/nested/index.html",
  proxy.id
);
assert(rewritten.includes(`/view/${proxy.id}/proxy?url64=`));
const proxiedUrls = [...rewritten.matchAll(/url64=([^"']+)/g)].map(match => Buffer.from(decodeURIComponent(match[1]), "base64").toString("utf8"));
assert(proxiedUrls.includes("http://127.0.0.1:8080/app.css"));
assert(proxiedUrls.includes("http://127.0.0.1:8080/nested/main.js"));
assert(rewritten.includes('src="data:image/png;base64,abc"'));

const calls = [];
const fake = {
  request: { headers: {}, user: { info: { userId: "asdf" } } },
  response: { headersSent: false, setHeader() {} },
  use(route, handler) {
    calls.push(route);
    return Promise.resolve(route.includes("raw") || route.includes("ws") || route.includes("proxy") ? null : handler({ previewId: proxy.id }));
  }
};
rootRoute.dynamicRoutes(fake).then(() => {
  assert(calls.includes(":previewId"));
  assert(calls.includes(":previewId/raw"));
  assert(calls.includes(":previewId/proxy"));
  assert(calls.includes(":previewId/ws"));
  console.log("BHY preview root view route tests passed");
}).catch(error => { console.error(error); process.exit(1); });
