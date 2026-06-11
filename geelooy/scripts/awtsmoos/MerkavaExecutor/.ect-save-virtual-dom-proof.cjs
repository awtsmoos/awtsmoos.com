// B"H
async function main() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const fs = require("fs");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const project = complexProject();
  const result = globalThis.AwtsEctCompiler.compileProject(project, Parser);
  const proof = {
    engine: "Merkava Virtual DOM",
    original: result.metrics.originalSourceBytes,
    storage: result.byteCount,
    ram: result.metrics.ramBytes,
    directRam: result.metrics.ramBytes === result.byteCount,
    lowRam: result.metrics.ramBytes < result.metrics.originalSourceBytes,
    proof: result.reconstruction.proof,
    html: result.reconstruction.html,
    css: result.reconstruction.css,
    js: result.reconstruction.js
  };
  fs.writeFileSync(".ect-virtual-dom-complex-proof.json", JSON.stringify(proof, null, 2));
  fs.writeFileSync(".ect-virtual-dom-complex.html", htmlPage(proof));
  fs.writeFileSync(".ect-virtual-dom-complex.svg", svgProof(proof));
  console.log(JSON.stringify({
    json: ".ect-virtual-dom-complex-proof.json",
    html: ".ect-virtual-dom-complex.html",
    svg: ".ect-virtual-dom-complex.svg",
    original: proof.original,
    storage: proof.storage,
    ram: proof.ram,
    directRam: proof.directRam,
    lowRam: proof.lowRam,
    reconstructable: proof.proof.reconstructable,
    unsupported: proof.proof.unsupportedFragments
  }, null, 2));
}

function htmlPage(proof) {
  return `<!doctype html><meta charset="utf-8"><title>ECT Virtual DOM Complex Proof</title><style>body{background:#02050a;color:#eaffff;font-family:system-ui;padding:24px}.badge{display:inline-block;background:#073;color:#9ff;padding:8px 12px;border-radius:999px}.frame{border:1px solid #75fff288;border-radius:18px;padding:18px;margin-top:16px}${proof.css}</style><div class="badge">${proof.engine} • ${proof.storage} bytes storage • ${proof.ram} bytes RAM</div><div class="frame">${proof.html}</div><pre>${escapeHtml(JSON.stringify(proof.proof, null, 2))}</pre>`;
}

function svgProof(proof) {
  const labels = [
    "Merkava Virtual DOM complex proof",
    `original ${proof.original} bytes`,
    `storage ${proof.storage} bytes`,
    `RAM ${proof.ram} bytes`,
    `direct RAM ${proof.directRam}`,
    `reconstructable ${proof.proof.reconstructable}`,
    "tree: main > article/card > header/button/output + article/list"
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><rect width="1200" height="760" fill="#02050a"/><text x="40" y="60" fill="#73fff2" font-family="monospace" font-size="28">${labels[0]}</text>${labels.slice(1).map((label, index) => `<text x="40" y="${110 + index * 34}" fill="#eaffff" font-family="monospace" font-size="22">${escapeHtml(label)}</text>`).join("")}<rect x="40" y="330" width="1120" height="360" rx="24" fill="#071923" stroke="#73fff2"/><text x="80" y="390" fill="#eaffff" font-family="monospace" font-size="18">${escapeHtml(proof.html.slice(0, 120))}</text><text x="80" y="430" fill="#eaffff" font-family="monospace" font-size="18">${escapeHtml(proof.html.slice(120, 240))}</text><text x="80" y="470" fill="#eaffff" font-family="monospace" font-size="18">${escapeHtml(proof.html.slice(240, 360))}</text></svg>`;
}

function complexProject() {
  return { title: "Complex Virtual DOM", files: {
    "index.html": '<main class="dash"><article class="card" id="alpha"><header><h2>Alpha</h2><button id="go">Run</button></header><section><p>Nested text</p><output id="out">waiting</output></section></article><article class="card"><h2>Beta</h2><ul><li>One</li><li>Two</li><li>Three</li></ul></article></main>',
    "style.css": '.dash{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:24px}.card{border-radius:18px;background:#071923;color:#eaffff;padding:18px}button{padding:10px;border-radius:999px}output{display:block;color:#73fff2}',
    "app.js": 'const go=document.getElementById("go");const out=document.getElementById("out");go.addEventListener("click",()=>{out.textContent="ok";});'
  } };
}
function escapeHtml(value) { return String(value).replace(/[&<>]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[ch])); }
main().catch(error => { console.error(error && error.stack || error); process.exit(1); });
