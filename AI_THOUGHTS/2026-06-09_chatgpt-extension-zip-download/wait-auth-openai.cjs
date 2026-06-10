// B"H
const { handleRelay } = require("../../geelooy/apps/tunnel/agent/tools/relay/index.js");
async function cdp(method, params = {}, timeoutMs = 15000) {
  return await handleRelay({ action: "relayBrowserCdp", method, params, timeoutMs });
}
async function main() {
  await cdp("Page.navigate", { url: "https://auth.openai.com/log-in" }, 20000);
  await new Promise(resolve => setTimeout(resolve, 30000));
  const expression = `(() => ({
    title: document.title,
    href: location.href,
    body: document.body ? document.body.innerText.slice(0, 1200) : "",
    hasGoogle: /google/i.test(document.body ? document.body.innerText : ""),
    controls: Array.from(document.querySelectorAll("button,a,input,iframe,[role=button]")).map((x, i) => ({
      i, tag: x.tagName,
      text: (x.innerText || x.value || x.getAttribute("aria-label") || x.src || x.href || "").slice(0, 160),
      visible: !!(x.offsetWidth || x.offsetHeight || x.getClientRects().length)
    })).slice(0, 40)
  }))()`;
  const result = await cdp("Runtime.evaluate", { expression, returnByValue: true }, 10000);
  console.log(JSON.stringify(result.result.result.value, null, 2));
  process.exit(0);
}
main().catch(error => { console.error(error.stack || error.message || error); process.exit(1); });
