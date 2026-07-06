// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { optimizeDom } = require("../runtime/domOptimizer.js");

/** B"H: opens the known ChatGPT URL if needed, then prunes old DOM weight. */
async function chatgptOptimizeDom(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const url = payload.url || payload.conversationUrl || "https://chatgpt.com/";
  await ensureProfileChrome({ ...payload, port, url, navigate: payload.navigate !== false });
  return await optimizeDom({ ...payload, port });
}

module.exports = { chatgptOptimizeDom };
