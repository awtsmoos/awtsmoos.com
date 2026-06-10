// B"H
const { handleRelay } = require("../../geelooy/apps/tunnel/agent/tools/relay/index.js");
async function cdp(method, params = {}, timeoutMs = 15000) {
  return await handleRelay({ action: "relayBrowserCdp", method, params, timeoutMs });
}
async function inspect(url) {
  await cdp("Page.navigate", { url }, 20000);
  await new Promise(resolve => setTimeout(resolve, 7000));
  const expression = `(() => ({
    title: document.title,
    href: location.href,
    body: document.body ? document.body.innerText.slice(0, 900) : "",
    controls: Array.from(document.querySelectorAll("button,a,input,iframe,[role=button]")).map((x, i) => ({
      i,
      tag: x.tagName,
      text: (x.innerText || x.value || x.getAttribute("aria-label") || x.src || x.href || "").slice(0, 180),
      visible: !!(x.offsetWidth || x.offsetHeight || x.getClientRects().length)
    })).filter(x => /google|continue|sign|log|email|cloudflare|verify/i.test(x.text)).slice(0, 40)
  }))()`;
  const result = await cdp("Runtime.evaluate", { expression, returnByValue: true }, 10000);
  return result.result.result.value;
}
async function main() {
  const urls = [
    "https://auth.openai.com/log-in",
    "https://auth.openai.com/login",
    "https://platform.openai.com/login"
  ];
  for (const url of urls) {
    const state = await inspect(url);
    console.log("URL_TEST " + url);
    console.log(JSON.stringify(state, null, 2));
    if (/google|continue with google/i.test(JSON.stringify(state))) break;
  }
  process.exit(0);
}
main().catch(error => { console.error(error.stack || error.message || error); process.exit(1); });
