// B"H
const { handleRelay } = require("../../geelooy/apps/tunnel/agent/tools/relay/index.js");

async function main() {
  const expression = `(() => ({
    title: document.title,
    href: location.href,
    ready: document.readyState,
    bodyLen: document.body ? document.body.innerText.length : 0,
    body: document.body ? document.body.innerText.slice(0, 500) : "",
    hasGoogle: /google/i.test(document.body ? document.body.innerText : ""),
    hasSignIn: /sign in|log in|continue/i.test(document.body ? document.body.innerText : ""),
    controls: Array.from(document.querySelectorAll("button,a,input,iframe,[role=button]")).slice(0, 20).map((x, i) => ({
      i,
      tag: x.tagName,
      text: (x.innerText || x.value || x.getAttribute("aria-label") || x.src || x.href || "").slice(0, 120),
      visible: !!(x.offsetWidth || x.offsetHeight || x.getClientRects().length)
    }))
  }))()`;
  const result = await handleRelay({
    action: "relayBrowserCdp",
    method: "Runtime.evaluate",
    params: { expression, returnByValue: true },
    timeoutMs: 8000
  });
  console.log(JSON.stringify(result.result.result.value, null, 2));
  process.exit(0);
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
