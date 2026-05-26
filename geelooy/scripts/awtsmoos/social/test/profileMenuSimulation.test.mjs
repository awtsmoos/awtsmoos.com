// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { matchDynamicRoute } from "../../../../../ayzarim/awtsmoosDynamicServer/routing/dynamicRouteMatcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../../../");

const read = (...parts) => fs.readFileSync(path.join(repoRoot, ...parts), "utf8");

function makeResponse({ ok = true, status = 200, statusText = "OK", body = {} } = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok,
    status,
    statusText,
    async text() {
      return text;
    }
  };
}

async function loadAliasApiWithFetch(fetchImpl) {
  globalThis.fetch = fetchImpl;
  const tmpDir = path.join(repoRoot, ".awtsmoos/tmp/profile-menu-simulation");
  fs.mkdirSync(tmpDir, { recursive: true });
  const sourcePath = path.join(repoRoot, "geelooy/scripts/awtsmoos/api/social/alias.js");
  const tempModulePath = path.join(tmpDir, `alias-api-${Date.now()}-${Math.random()}.mjs`);
  fs.writeFileSync(tempModulePath, fs.readFileSync(sourcePath, "utf8"));

  try {
    return await import(pathToFileURL(tempModulePath).href);
  } finally {
    fs.rmSync(tempModulePath, { force: true });
  }
}

async function loadBrowserModuleAsMjs(relativePath) {
  const tmpDir = path.join(repoRoot, ".awtsmoos/tmp/profile-menu-simulation");
  fs.mkdirSync(tmpDir, { recursive: true });
  const sourcePath = path.join(repoRoot, relativePath);
  const tempModulePath = path.join(tmpDir, `${path.basename(relativePath)}-${Date.now()}-${Math.random()}.mjs`);
  fs.writeFileSync(tempModulePath, fs.readFileSync(sourcePath, "utf8"));

  try {
    return await import(pathToFileURL(tempModulePath).href);
  } finally {
    fs.rmSync(tempModulePath, { force: true });
  }
}

async function testAwtsmoosSocialHandlerResponseShapes() {
  const { default: AwtsmoosSocialHandler } = await loadBrowserModuleAsMjs("geelooy/scripts/awtsmoos/social/AwtsmoosSocialHandler.js");
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return makeResponse({ body: "not-json" });
  };

  const handler = new AwtsmoosSocialHandler("/api/social", "aliases");
  const invalid = await handler.fetchEntities("details");
  assert.equal(invalid.error.code, "INVALID_JSON");
  assert.equal(calls[0].opts.credentials, "include");

  globalThis.fetch = async () => makeResponse({
    ok: false,
    status: 500,
    statusText: "Broken",
    body: { reason: "server" }
  });
  const failed = await handler.fetchEntities("details");
  assert.equal(failed.error.code, 500);
  assert.equal(failed.error.details.reason, "server");
}

async function testAliasApiEncoding() {
  const calls = [];
  const api = await loadAliasApiWithFetch(async (url, opts) => {
    calls.push({ url, opts });
    return makeResponse({ body: { code: "YES", series: [] } });
  });

  await api.getAliasDetails("אבג space/seg");
  await api.getAliasOwnership("אבג space/seg");
  await api.getHeichelosOfPostsOfAlias({ aliasId: "אבג space/seg" });
  await api.getSeriesOfPostsOfAliasInHeichel({ aliasId: "אבג", heichelId: "heichel one" });
  await api.getPostsOfAliasInSeries({ aliasId: "אבג", heichelId: "heichel one", path: "root/inner path" });
  await api.getHeichelosOfCommentsOfAlias({ aliasId: "אבג space/seg" });
  await api.getCommentSeriesOfAliasInHeichel({ aliasId: "אבג", heichelId: "heichel one" });

  assert.equal(calls.length, 7);
  assert.match(calls[0].url, /%D7%90%D7%91%D7%92%20space%2Fseg\/details$/);
  assert.match(calls[1].url, /%D7%90%D7%91%D7%92%20space%2Fseg\/ownership$/);
  assert.match(calls[2].url, /aliases\/%D7%90%D7%91%D7%92%20space%2Fseg\/postsMade\/heichelos$/);
  assert.match(calls[3].url, /aliases\/%D7%90%D7%91%D7%92\/postsMade\/heichel\/heichel%20one\/series$/);
  assert.match(calls[4].url, /pathToSeries\//);
  assert.match(calls[5].url, /aliases\/%D7%90%D7%91%D7%92%20space%2Fseg\/commentsMade\/heichelos$/);
  assert.match(calls[6].url, /aliases\/%D7%90%D7%91%D7%92\/commentsMade\/heichel\/heichel%20one\/series$/);
  assert.match(calls[5].url, /aliases\/%D7%90%D7%91%D7%92%20space%2Fseg\/commentsMade\/heichelos$/);
  assert.match(calls[6].url, /aliases\/%D7%90%D7%91%D7%92\/commentsMade\/heichel\/heichel%20one\/series$/);
}

async function testAliasApiErrorShape() {
  const api = await loadAliasApiWithFetch(async () => makeResponse({
    ok: false,
    status: 503,
    statusText: "Service Unavailable",
    body: { reason: "offline" }
  }));
  const response = await api.getAliasDetails("x");
  assert.equal(response.error.code, 503);
  assert.equal(response.error.message, "Service Unavailable");
  assert.deepEqual(response.error.details, { reason: "offline" });
}

function testRouteMatcherManyTimes() {
  const aliases = ["simple", "space alias", "אבג", "dots.and-dashes_123"];
  for (let i = 0; i < 60; i++) {
    for (const alias of aliases) {
      const result = matchDynamicRoute(":a", encodeURIComponent(alias));
      assert.equal(result.doesRouteMatchURL, true);
      assert.equal(result.vars.a, alias);
    }
  }
}

function testProfileDropdownSourceInvariants() {
  const source = read("geelooy/scripts/awtsmoos/social/profileDropdown.js");
  assert.match(source, /function aliasProfileHref\(aliasId\)/);
  assert.match(source, /encodeURIComponent\(aliasId\)/);
  assert.match(source, /new URLSearchParams\(\{ alias: w\.id \}\)\.toString\(\)/);
  assert.match(source, /awtsmoos-dropdown-backdrop/);
  assert.doesNotMatch(source, /sty\.innerHTML\s*=/);
  assert.doesNotMatch(source, /document\.getElementById\('logoutSection'\)\.innerHTML/);
  assert.doesNotMatch(source, /body:\s*'alias=' \+ w\.id/);
  assert.doesNotMatch(source, /['"]\/@['"]\s*\+/);
  assert.doesNotMatch(source, /['"]\/@['"]\s*\+/);
  assert.doesNotMatch(source, /h\.innerHTML\s*=\s*'Setting as default/);
  assert.doesNotMatch(source, /h\.innerHTML\s*=\s*'Couldn't set default/);
}

function testProfileCssInvariants() {
  const css = read("geelooy/style/social/profileStyles.css");
  assert.match(css, /\.awtsmoos-dropdown-backdrop/);
  assert.match(css, /inset:\s*0/);
  assert.match(css, /@media \(max-width: 600px\)/);
  const aliasCss = read("geelooy/style/social/alias.css");
  assert.match(aliasCss, /alias-activity-summary/);
  assert.match(aliasCss, /@media \(max-width: 640px\)/);
}

function testEmailChatSourceInvariants() {
  const store = read("geelooy/email/store.js");
  const sidebar = read("geelooy/email/ui/sidebar.js");
  const modals = read("geelooy/email/ui/modals.js");
  const sidebarCss = read("geelooy/email/css/sidebar.css");
  const composerCss = read("geelooy/email/css/composer.css");

  assert.match(store, /params\.get\('to'\)/);
  assert.match(store, /openComposeTo\(ui, toAlias\)/);
  assert.match(store, /params\.get\('alias'\)/);
  assert.doesNotMatch(store, /console\.log/);

  assert.match(sidebar, /mail-sidebar-profile-mount/);
  assert.doesNotMatch(sidebar, /document\.createElement\('style'\)/);
  assert.doesNotMatch(sidebar, /style\.textContent/);

  assert.match(modals, /identity-modal-card/);
  assert.match(modals, /compose-body-input/);
  assert.doesNotMatch(modals, /Mounting Profile Dropdown/);
  assert.doesNotMatch(modals, /innerHTML =/);

  assert.match(sidebarCss, /mail-sidebar-profile-mount/);
  assert.match(sidebarCss, /thread-empty-state/);
  assert.match(composerCss, /identity-modal-card/);
  assert.match(composerCss, /compose-body-input/);
}

function testBroadSocialSourceInvariants() {
  const socialDir = path.join(repoRoot, "geelooy/scripts/awtsmoos/social");
  const files = fs.readdirSync(socialDir)
    .filter(name => name.endsWith(".js"))
    .map(name => path.join(socialDir, name));

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /console\.log/, `${path.basename(file)} should not ship production console.log`);
  }

  const aliasModule = read("geelooy/scripts/awtsmoos/social/AliasModule.js");
  assert.match(aliasModule, /encodeURIComponent\(entity\.id\)/);
  assert.match(aliasModule, /encodeURIComponent\(m\.id\)/);
  assert.doesNotMatch(aliasModule, /\?alias=\$\{entity\.id\}/);
  assert.doesNotMatch(aliasModule, /viewURL:\s*m\s*=>\s*["']\/@["']\s*\+\s*m\.id/);
}

function testAliasPageSourceInvariants() {
  const source = read("geelooy/scripts/awtsmoos/social/aliasPage.js");
  assert.doesNotMatch(source, /console\.log/);
  assert.match(source, /encodeURIComponent\(this\.state\.heichel\?\.id/);
  assert.match(source, /encodeURIComponent\(heichelId\)/);
  assert.match(source, /response\.error\?\.message/);
  assert.match(source, /getHeichelosOfCommentsOfAlias/);
  assert.match(source, /alias-activity-summary/);
  assert.match(source, /_createProfileActions/);
  assert.match(source, /alias-profile-message/);
  assert.match(source, /\/email\?to=/);
  assert.match(source, /encodeURIComponent\(aliasId\)/);
  assert.match(source, /_createProfileActions/);
  assert.match(source, /alias-profile-message/);
  assert.match(source, /\/email\?to=/);
  assert.match(source, /encodeURIComponent\(aliasId\)/);
  assert.match(source, /getHeichelosOfCommentsOfAlias/);
  assert.match(source, /alias-activity-summary/);
  assert.match(source, /_createProfileActions/);
  assert.match(source, /alias-profile-message/);
  assert.match(source, /\/email\?to=/);
  assert.match(source, /encodeURIComponent\(aliasId\)/);
  assert.match(source, /_createProfileActions/);
  assert.match(source, /alias-profile-message/);
  assert.match(source, /\/email\?to=/);
  assert.match(source, /encodeURIComponent\(aliasId\)/);
}

for (let i = 0; i < 20; i++) {
  testRouteMatcherManyTimes();
  testProfileDropdownSourceInvariants();
  testProfileCssInvariants();
  testAliasPageSourceInvariants();
  testBroadSocialSourceInvariants();
  testEmailChatSourceInvariants();
}
await testAliasApiEncoding();
await testAliasApiErrorShape();
await testAwtsmoosSocialHandlerResponseShapes();

console.log("B\"H profileMenuSimulation.test passed");
