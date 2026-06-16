// B"H
const assert = require("assert");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");

const payload = { controlBaseUrl: "https://awtsmoos.com/api/tunnel/control/fs/native-one", tunnelName: "native-one", path: "dist/index.html", visibility: "private", title: "Dist" };
const actions = buildPreviewActions({ payload });

(async () => {
  const file = await actions.previewFile();
  assert.strictEqual(file.preview.kind, "file");
  assert(file.url.includes("/api/tunnel/control/preview/create"));
  assert(file.url.includes("preview64="));
  const server = await actions.previewExposeLocalServer.call(null, { });
  const proxy = await buildPreviewActions({ payload: { ...payload, port: 5173 } }).previewExposeLocalServer();
  assert.strictEqual(proxy.preview.kind, "proxy");
  assert(proxy.proxyUrl.includes("/api/tunnel/control/preview/native-one"));
  const page = await buildPreviewActions({ payload: { ...payload, content: "<h1>Report</h1>" } }).previewPage();
  assert.strictEqual(page.preview.kind, "page");
  console.log("BHY native preview actions tests passed");
})().catch(error => { console.error(error); process.exit(1); });
