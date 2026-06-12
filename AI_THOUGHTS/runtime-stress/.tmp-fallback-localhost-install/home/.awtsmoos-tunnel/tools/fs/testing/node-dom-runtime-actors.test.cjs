// B"H
const assert = require("assert");
const path = require("path");
const { simulateNodeDomRuntime } = require(path.join(__dirname, "../nodeDomRuntime/index.js"));
const { buildRuntimeActions } = require(path.join(__dirname, "../actionGroups/runtimeActions.js"));

async function timerActor() {
  const html = `<body><div id="out"></div><script>const order=['sync'];Promise.resolve().then(()=>order.push('micro'));setTimeout(()=>{order.push('timeout');out.textContent='ORDER:'+order.join(',');},25);</script></body>`;
  const r = await simulateNodeDomRuntime({ entry: "index.html", files: { "index.html": html }, waitMs: 50, returnValues: ["out.textContent"] });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.values["out.textContent"], "ORDER:sync,micro,timeout");
  return r.values["out.textContent"];
}

async function actionActor() {
  const html = `<body><input id="name"><button id="go">Go</button><div id="out"></div><script>go.addEventListener('click',()=>out.textContent='Hello '+name.value)</script></body>`;
  const r = await simulateNodeDomRuntime({ entry: "index.html", files: { "index.html": html }, browserActions: [{ action: "fill", selector: "#name", value: "Dovid" }, { action: "click", selector: "#go" }, { action: "assertText", selector: "#out", expected: "Hello Dovid" }], returnValues: ["out.textContent"] });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.values["out.textContent"], "Hello Dovid");
  return r.interactionLog.length;
}

async function moduleActor() {
  const files = {
    "index.html": `<body><div id="out"></div><script type="importmap">{"imports":{"alias":"./src/alias.js"}}</script><script type="module" src="./src/app.js"></script></body>`,
    "src/app.js": `import value from 'alias'; import { more } from './more.js'; out.textContent='MODULE:'+(value+more);`,
    "src/alias.js": `export default 40`,
    "src/more.js": `export const more = 2`
  };
  const r = await simulateNodeDomRuntime({ entry: "index.html", files, returnValues: ["out.textContent"] });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.values["out.textContent"], "MODULE:42");
  return r.values["out.textContent"];
}

async function surfaceActor() {
  const html = `<body><canvas id="c"></canvas><div id="out"></div><script>const ctx=c.getContext('2d');ctx.fillRect(1,2,3,4);const gl=c.getContext('webgl');const sh=gl.createShader(gl.VERTEX_SHADER);const w=new Worker('./worker.js');w.onmessage=e=>out.textContent='WORKER:'+e.data;w.postMessage('ping');</script></body>`;
  const files = { "index.html": html, "worker.js": `self.onmessage=e=>postMessage(e.data+':pong')` };
  const r = await simulateNodeDomRuntime({ entry: "index.html", files, waitMs: 10, returnValues: ["out.textContent", "!!c.getContext('2d')", "!!c.getContext('webgl')"] });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.values["!!c.getContext('2d')"], true);
  assert.equal(r.values["!!c.getContext('webgl')"], true);
  return r.values["out.textContent"];
}

async function actionPathActor() {
  const html = `<body><div id="out"></div><script>out.textContent='ACTIONPATH'</script></body>`;
  const cfg = { root: process.cwd(), allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true } };
  const payload = { action: "simulateRuntime", engine: "node-dom", entry: "index.html", html, returnValues: ["out.textContent"] };
  const r = await buildRuntimeActions({ payload, config: cfg }).simulateRuntime();
  assert.equal(r.engine, "node-dom");
  assert.equal(r.values["out.textContent"], "ACTIONPATH");
  return r.engine;
}

(async () => {
  const actors = { timer: await timerActor(), actions: await actionActor(), module: await moduleActor(), surface: await surfaceActor(), actionPath: await actionPathActor() };
  console.log(JSON.stringify({ ok: true, actors }, null, 2));
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
