// B"H
const assert = require("assert");
const path = require("path");
const { simulateNodeDomRuntime } = require(path.join(__dirname, "../nodeDomRuntime/index.js"));

(async () => {
  const html = `<body><input id="name"><button id="go">Go</button><div id="out"></div><script>
  (async()=>{const b=await puppeteer.launch();const p=await b.newPage();await p.fill('#name','Puppet');await p.click('#go');})();
  go.addEventListener('click',()=>out.textContent='Compat '+name.value);
  </script></body>`;
  const r = await simulateNodeDomRuntime({ entry: "index.html", files: { "index.html": html }, waitMs: 10, returnValues: ["out.textContent", "typeof chromium.launch", "typeof puppeteer.launch"] });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.values["out.textContent"], "Compat Puppet");
  assert.equal(r.values["typeof chromium.launch"], "function");
  assert.equal(r.capabilities.playwrightApi, "compat-subset");
  assert.equal(r.capabilities.webgl, "state-command-recorder");
  console.log(JSON.stringify({ ok: true, values: r.values, capabilities: r.capabilities }, null, 2));
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
