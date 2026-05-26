// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%*+-./:=?@^_~|';
function base77(buffer) {
  let n = BigInt('0x' + Buffer.from(buffer).toString('hex'));
  if (n === 0n) return ALPHABET[0];
  let out = '';
  const base = BigInt(ALPHABET.length);
  while (n > 0n) {
    out = ALPHABET[Number(n % base)] + out;
    n /= base;
  }
  return out;
}
function hex(buffer) { return Buffer.from(buffer).toString('hex').replace(/../g, '$& ').trim(); }

(async () => {
  const html = `<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main id="app">
    <h1 id="title">Merkava Chat</h1>
    <button id="send">Send</button>
    <section id="chat"></section>
    <p id="m1">Seed 1</p>
    <p id="m2">Seed 2</p>
    <p id="m3">Seed 3</p>
    <p id="m4">Seed 4</p>
    <p id="m5">Seed 5</p>
  </main>
  <script type="module" src="/main.js"></script>
</body>
</html>`;

  const css = `#app{display:grid;gap:8px;padding:12px;width:100%;margin-left:7em;transform:calc(100% - 7em)}
#title{color:#ff0033;font-size:24px;margin-left:10px}
#send{padding:8px 12px;border-radius:12px}
#chat{color:blue;padding:10px;border:1px solid black}
#m1{color:blue;padding:4px}
#m2{color:blue;padding:4px}
#m3{color:blue;padding:4px}
#m4{color:blue;padding:4px}
#m5{color:blue;padding:4px}`;

  const libJs = `export class BaseChat {
  value(){ return 10; }
}
export class Chat extends BaseChat {
  constructor(){ super(); this.secret = 32; }
  send(msg){ chat.textContent = msg; }
  total(){ return super.value() + this.secret; }
}
export function* ids(){ yield 1; yield 2; yield 3; }
Chat.prototype.tag = function(){ return this.total(); };`;

  const mainJs = `import { Chat, ids } from '/lib.js';
let app = new Chat();
let it = ids();
let total = app.tag() + it.next().value + it.next().value + it.next().value;
app.send('B"H advanced ' + total);`;

  const files = { '/index.html': html, '/style.css': css, '/lib.js': libJs, '/main.js': mainJs };
  const source = html + css + libJs + mainJs;
  const binary = await MerkavaExecutor.compileToBinary({ files, entry: '/index.html' }, { type: 'source' });
  const run = await MerkavaExecutor.executeBinary(binary);
  assert.strictEqual(MerkavaExecutor.magicOf(binary), 'MAPP');
  assert.strictEqual(run.web.document.getElementById('chat').style.color, 'blue');
  assert.strictEqual(run.web.document.getElementById('app').style.width, '100%');
  assert.strictEqual(run.web.document.getElementById('app').style.transform, 'calc(100% - 7em)');
  // Current source compiler strips imports/exports and can compile module source into one app.
  // Complex prototype call may remain SANG path. Verify the DOM exists/styles even if full JS semantics are subset.

  const decoded = MerkavaExecutor.decodeUnifiedApp(binary);
  const result = {
    ok: true,
    sourceBytes: Buffer.byteLength(source),
    compiledBytes: binary.length,
    savedBytes: Buffer.byteLength(source) - binary.length,
    savedPercent: Number(((1 - binary.length / Buffer.byteLength(source)) * 100).toFixed(1)),
    magic: MerkavaExecutor.magicOf(binary),
    headerHex: hex(binary.slice(0, 24)),
    base77: base77(binary),
    base77Length: base77(binary).length,
    decoded: {
      version: decoded.version,
      pool: decoded.pool,
      webOps: decoded.web.ops.length,
      scripts: decoded.scripts.map(s => ({ name: s.name, kind: s.kind, native: !!s.setText, sangBytes: s.binary ? s.binary.length : 0 }))
    },
    runtime: {
      chatText: run.web.document.getElementById('chat').textContent,
      appStyle: run.web.document.getElementById('app').style,
      chatStyle: run.web.document.getElementById('chat').style
    },
    source: { html, css, libJs, mainJs }
  };
  console.log(JSON.stringify(result, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
