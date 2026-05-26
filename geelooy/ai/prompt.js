//B"H

const EXTENSION_ROOT = "/scripts/tricks/extensions/server";
const EXTENSION_FILE_NAMES = [
  "manifest.json",
  "background.js",
  "awtsmoosContent.js",
  "jected.js",
  "streamLedger.js",
  "bgAutomation/storage.js",
  "bgAutomation/graph.js",
  "bgAutomation/chatgpt.js",
  "bgAutomation/pageDelegate.js",
  "bgAutomation/engine.js",
  "bgAutomation/api.js"
];
const EXTENSION_FILES = EXTENSION_FILE_NAMES.map(name => ({ name, url: `${EXTENSION_ROOT}/${name}` }));

export class AwtsmoosPrompt {
  static async go(options = {}) {
    const shared = globalThis?.AwtsmoosPrompt;
    if (shared?.go && shared !== AwtsmoosPrompt) return await shared.go(options);
    return renderLocalPrompt(options);
  }
}

function renderLocalPrompt(options = {}) {
  return new Promise(resolve => {
    const isAlert = Boolean(options.isAlert);
    const overlay = document.createElement("div");
    overlay.className = "awtsmoos-local-prompt-overlay";
    overlay.innerHTML = markup(options, isAlert);
    document.body.appendChild(overlay);
    const input = overlay.querySelector("input");
    input?.focus();
    const finish = value => { overlay.remove(); resolve(value); };
    overlay.addEventListener("click", event => handleClick(event, { input, isAlert, finish }));
    overlay.addEventListener("keydown", event => {
      if (event.key === "Escape") finish(null);
      if (event.key === "Enter" && !isAlert) finish(input?.value ?? null);
    });
  });
}

async function handleClick(event, context) {
  const action = event.target?.dataset?.awtsAction;
  if (action === "download-extension") return downloadExtensionZip(event.target);
  if (action === "ok") context.finish(context.isAlert ? true : context.input?.value ?? null);
  if (action === "cancel") context.finish(null);
}

async function downloadExtensionZip(button) {
  button.disabled = true;
  button.textContent = "Building zip…";
  try {
    const zip = await import("/scripts/awtsmoos/zip/api.js");
    await zip.downloadZipFromUrls(EXTENSION_FILES, { zipName: "awtsmoos-server-extension.zip" });
    button.textContent = "Downloaded zip";
  } catch (error) {
    console.error("Extension zip failed", error);
    button.textContent = "Zip failed — see console";
  } finally {
    setTimeout(() => { button.disabled = false; button.textContent = "Download extension zip"; }, 1800);
  }
}

function markup(options, isAlert) {
  return `
    <style>${style()}</style>
    <section class="awtsmoos-local-prompt-card" role="dialog" aria-modal="true" aria-labelledby="awtsmoos-local-prompt-title">
      <h2 id="awtsmoos-local-prompt-title">B"H — Awtsmoos Server Extension Needed</h2>
      <div class="awtsmoos-local-prompt-body">${options.headerTxt || defaultExtensionHelp()}</div>
      ${isAlert ? "" : `<input class="awtsmoos-local-prompt-input" placeholder="${escapeAttr(options.placeholderTxt || "")}" value="${escapeAttr(options.defaultValue || "")}" />`}
      <div class="awtsmoos-local-prompt-actions">
        <button type="button" data-awts-action="download-extension">Download extension zip</button>
        <a href="https://github.com/awtsmoos/awtsmoos.com/tree/main/geelooy/scripts/tricks/extensions/server" target="_blank" rel="noreferrer">View source</a>
        <button type="button" data-awts-action="ok">${isAlert ? "Got it" : "OK"}</button>
        <button class="secondary" type="button" data-awts-action="cancel">Close</button>
      </div>
    </section>`;
}

function defaultExtensionHelp() {
  return `<p>The Awtsmoos AI cockpit needs the local <strong>Awtsmoos Server Extension</strong> bridge before ChatGPT requests can flow.</p><p>Click <strong>Download extension zip</strong>, unzip it, load it in <code>chrome://extensions</code> with Developer Mode, then refresh this page.</p>`;
}

function style() {
  return `.awtsmoos-local-prompt-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:rgba(2,8,18,.72);backdrop-filter:blur(8px);color:#e8f4ff;font-family:Inter,ui-sans-serif,system-ui}.awtsmoos-local-prompt-card{width:min(620px,100%);border:1px solid rgba(99,179,237,.28);border-radius:24px;background:linear-gradient(145deg,rgba(4,17,31,.97),rgba(3,30,45,.94));box-shadow:0 24px 80px rgba(0,0,0,.45);padding:24px}.awtsmoos-local-prompt-body{color:rgba(232,244,255,.86);line-height:1.55;font-size:15px}.awtsmoos-local-prompt-body a{color:#7dd3fc}.awtsmoos-local-prompt-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.awtsmoos-local-prompt-actions button,.awtsmoos-local-prompt-actions a{appearance:none;border:1px solid rgba(125,211,252,.28);border-radius:14px;padding:10px 14px;background:rgba(14,116,144,.28);color:#e0f2fe;text-decoration:none;font-weight:700;cursor:pointer}.awtsmoos-local-prompt-actions .secondary{background:rgba(15,23,42,.65)}.awtsmoos-local-prompt-input{width:100%;margin-top:16px;box-sizing:border-box;border-radius:14px;border:1px solid rgba(125,211,252,.24);background:rgba(2,6,23,.72);color:#e8f4ff;padding:12px 14px;font:inherit}`;
}

function escapeAttr(text) { return String(text || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
