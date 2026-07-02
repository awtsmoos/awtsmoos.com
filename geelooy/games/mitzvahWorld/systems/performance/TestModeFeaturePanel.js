// B"H
/** @file TestModeFeaturePanel.js @purpose Small in-game visual toggles for performance test runs. */
const FLAG_KEY = "__AWTSMOOS_TEST_FEATURE_FLAGS__";
const PANEL_ID = "awtsmoosTestFeaturePanel";
const STORE_KEY = "awtsmoos:test-feature-flags:v1";

const DEFAULT_FLAGS = Object.freeze({
  grassVisuals: true,
  houseVisuals: true,
  terrainTextures: true,
  workerPlayerMixer: false
});

const FEATURE_ROWS = Object.freeze([
  ["grassVisuals", "Grass"],
  ["houseVisuals", "Houses"],
  ["terrainTextures", "Textures"],
  ["workerPlayerMixer", "Mixer"]
]);

const STYLE = `
#${PANEL_ID}{position:fixed;right:10px;bottom:10px;z-index:9600;box-sizing:border-box;width:min(260px,calc(100vw - 20px));padding:8px;border:1px solid rgba(255,217,102,.58);border-radius:8px;background:rgba(7,12,21,.86);color:#f8f3dc;font:700 11px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.34);pointer-events:auto}
#${PANEL_ID} .awts-test-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;color:#ffd966;font-weight:900}
#${PANEL_ID} .awts-test-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#${PANEL_ID} button{height:30px;border-radius:7px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.1);color:#f8f3dc;font:800 11px system-ui,sans-serif;cursor:pointer}
#${PANEL_ID} button[aria-pressed="true"]{background:rgba(103,188,83,.52);border-color:rgba(161,231,130,.7);color:#fff}
#${PANEL_ID} button[aria-pressed="false"]{background:rgba(170,61,52,.42);border-color:rgba(255,140,116,.56);color:#ffe1d9}
#${PANEL_ID} .awts-test-status{margin-top:7px;color:#d8e8ff;font:700 10px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:760px){#${PANEL_ID}{right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));width:min(230px,calc(100vw - 16px));font-size:10px}#${PANEL_ID} button{height:28px;font-size:10px}}
`;

const lower = value => String(value || "").toLowerCase();
const isObject3D = value => Boolean(value?.isObject3D && value?.traverse);

function enabledForPage() {
  const params = new URLSearchParams(location.search);
  return params.get("testMode") === "1" || params.get("clearCaches") === "1" || params.get("compact") === "true";
}

function readStoredFlags() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeStoredFlags(flags) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(flags));
  } catch {}
}

function flags() {
  const existing = window[FLAG_KEY] || {};
  const merged = { ...DEFAULT_FLAGS, ...readStoredFlags(), ...existing };
  window[FLAG_KEY] = merged;
  window.__AWTSMOOS_ENABLE_WORKER_PLAYER_MIXER__ = merged.workerPlayerMixer === true;
  return merged;
}

function objectText(object) {
  const data = object?.userData || {};
  return lower([object?.name, object?.type, data.kind, data.type, data.recipe, data.houseId, data.surfaceKey, data.materialKey, data.biomeKey].filter(Boolean).join(" "));
}

function materialList(object) {
  const material = object?.material;
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function matchesGrass(object) {
  const text = objectText(object);
  return /grass|flora|flower|meadow|safegrass/.test(text);
}

function matchesHouse(object) {
  const text = objectText(object);
  return /house|cottage|building|roof|doorway|bakery|rebbe|toolmaker|trainer/.test(text) && !/collider|octree|collision/.test(text);
}

function matchesTerrainTexture(object) {
  const text = objectText(object);
  return /terrain|ground|grass|safegrass|dirt|road|path/.test(text);
}

function eachRoot(callback) {
  const seen = new WeakSet();
  const queue = [window.mana, window.ikar, window.olam, window.__AWTSMOOS_OLAM__, window.__AWTSMOOS_SCENE__].filter(Boolean);
  let scanned = 0;
  while (queue.length && scanned < 6000) {
    const item = queue.shift();
    if (!item || typeof item !== "object" || seen.has(item)) continue;
    seen.add(item);
    scanned += 1;
    if (isObject3D(item)) {
      callback(item);
      continue;
    }
    for (const key of Object.keys(item).slice(0, 60)) {
      const value = item[key];
      if (value && typeof value === "object") queue.push(value);
    }
  }
  return scanned;
}

function setObjectVisible(object, visible, bucket) {
  if (!object?.userData) object.userData = {};
  const key = `awtsmoosTestOriginalVisible:${bucket}`;
  if (object.userData[key] == null) object.userData[key] = object.visible !== false;
  object.visible = visible ? object.userData[key] !== false : false;
}

function setMaterialTexture(material, enabled) {
  if (!material) return false;
  material.userData ||= {};
  if (material.userData.awtsmoosTestOriginalMap === undefined) material.userData.awtsmoosTestOriginalMap = material.map || null;
  if (material.userData.awtsmoosTestOriginalNormalMap === undefined) material.userData.awtsmoosTestOriginalNormalMap = material.normalMap || null;
  material.map = enabled ? material.userData.awtsmoosTestOriginalMap : null;
  material.normalMap = enabled ? material.userData.awtsmoosTestOriginalNormalMap : null;
  material.needsUpdate = true;
  return true;
}

function applyFlags(state = flags()) {
  let grass = 0;
  let houses = 0;
  let textures = 0;
  eachRoot(root => root.traverse(object => {
    if (matchesGrass(object)) {
      setObjectVisible(object, state.grassVisuals, "grass");
      grass += 1;
    }
    if (matchesHouse(object)) {
      setObjectVisible(object, state.houseVisuals, "house");
      houses += 1;
    }
    if (matchesTerrainTexture(object)) {
      for (const material of materialList(object)) if (setMaterialTexture(material, state.terrainTextures)) textures += 1;
    }
  }));
  const report = { at:Date.now(), flags:{ ...state }, affected:{ grass, houses, textures } };
  window.__AWTSMOOS_TEST_FEATURE_REPORT__ = report;
  window.dispatchEvent(new CustomEvent("awtsmoos:test-feature-toggle", { detail:report }));
  return report;
}

function installStyle() {
  if (document.getElementById(`${PANEL_ID}Style`)) return;
  const style = document.createElement("style");
  style.id = `${PANEL_ID}Style`;
  style.textContent = STYLE;
  document.head.appendChild(style);
}

function renderPanel() {
  if (document.getElementById(PANEL_ID)) return;
  installStyle();
  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.innerHTML = `<div class="awts-test-head"><span>Test Features</span><span>visual</span></div><div class="awts-test-grid"></div><div class="awts-test-status">waiting for scene</div>`;
  const grid = panel.querySelector(".awts-test-grid");
  const status = panel.querySelector(".awts-test-status");
  const state = flags();
  for (const [key, label] of FEATURE_ROWS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.key = key;
    button.setAttribute("aria-pressed", String(state[key] === true));
    button.addEventListener("click", () => {
      const next = flags();
      next[key] = next[key] !== true;
      writeStoredFlags(next);
      window[FLAG_KEY] = next;
      window.__AWTSMOOS_ENABLE_WORKER_PLAYER_MIXER__ = next.workerPlayerMixer === true;
      for (const row of grid.querySelectorAll("button")) row.setAttribute("aria-pressed", String(next[row.dataset.key] === true));
      const report = applyFlags(next);
      status.textContent = `grass ${report.affected.grass} house ${report.affected.houses} tex ${report.affected.textures}`;
    });
    grid.appendChild(button);
  }
  document.body.appendChild(panel);
  setTimeout(() => {
    const report = applyFlags(state);
    status.textContent = `grass ${report.affected.grass} house ${report.affected.houses} tex ${report.affected.textures}`;
  }, 1600);
}

if (enabledForPage()) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderPanel, { once:true });
  else renderPanel();
  setInterval(() => applyFlags(flags()), 3000);
}
