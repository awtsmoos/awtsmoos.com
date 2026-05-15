// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { sp } = require("../../../social/helper/_awtsmoos.constants.js");

function responseBytes(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (_) { return 0; }
}

function identityAllows(ident, neededScope) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, neededScope) || scopeAllowed(ident, "tunnel.admin") || scopeAllowed(ident, "awtsmoos.os");
}

function normalizePath(path = ".") {
  return String(path || ".").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

function splitOsPath(path = ".") {
  const clean = normalizePath(path);
  if (!clean || clean === ".") return { root: true, aliasId: "", innerPath: "" };
  const parts = clean.split("/").filter(Boolean);
  const aliasId = parts.shift() || "";
  return { root: false, aliasId, innerPath: parts.join("/") };
}

async function aliasOwned($i, userId, aliasId) {
  if (!aliasId) return false;
  return await $i.db.get(`/users/${userId}/aliases/${aliasId}`);
}

async function listAliases($i, userId) {
  const aliases = await $i.db.get(`/users/${userId}/aliases/`, { pageSize: 1000, keepJSON: true, extra: true });
  if (Array.isArray(aliases)) return aliases;
  if (!aliases || typeof aliases !== "object") return [];

  return Object.entries(aliases).map(([id, value]) => {
    if (value && typeof value === "object") return { ...value, aliasId: value.aliasId || id, id };
    return { aliasId: id, id, name: id };
  });
}

function publicAliasItem(alias) {
  const obj = typeof alias === "string" ? { aliasId: alias, id: alias, name: alias } : (alias || {});
  const id = obj.aliasId || obj.id || obj.name;
  if (!id) return null;
  return {
    name: id,
    displayName: obj.name || id,
    type: "directory",
    isDirectory: true,
    path: id,
    aliasId: id
  };
}

function publicEntry(aliasId, base, name, value) {
  const isDir = value && typeof value === "object" && !Buffer.isBuffer(value);
  const path = [aliasId, base, name].filter(Boolean).join("/");
  return {
    name,
    type: isDir ? "directory" : "file",
    isDirectory: isDir,
    path,
    aliasId
  };
}

async function listFolder($i, userId, payload) {
  const parsed = splitOsPath(payload.path || payload.p || ".");

  if (parsed.root) {
    const detailedItems = (await listAliases($i, userId)).map(publicAliasItem).filter(Boolean);
    return {
      ok: true,
      action: "list",
      root: "Awtsmoos OS",
      path: ".",
      items: detailedItems.map(x => x.name + "/"),
      detailedItems
    };
  }

  const owns = await aliasOwned($i, userId, parsed.aliasId);
  if (!owns) return { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId };

  const folderPath = `${sp}/aliases/${parsed.aliasId}/fileSystem/${parsed.innerPath}`;
  const got = await $i.db.read(folderPath, { pageSize: 1000, keepJSON: true, extra: true });
  const raw = got || [];
  let detailedItems = [];

  if (Array.isArray(raw)) {
    detailedItems = raw.map(x => typeof x === "string"
      ? publicEntry(parsed.aliasId, parsed.innerPath, x, null)
      : publicEntry(parsed.aliasId, parsed.innerPath, x.name || x.id, x));
  } else if (typeof raw === "object") {
    detailedItems = Object.entries(raw).map(([name, value]) => publicEntry(parsed.aliasId, parsed.innerPath, name, value));
  }

  return {
    ok: true,
    action: "list",
    root: "Awtsmoos OS",
    path: payload.path || ".",
    items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name),
    detailedItems
  };
}

async function readFile($i, userId, payload) {
  const parsed = splitOsPath(payload.path || payload.p || ".");
  if (parsed.root || !parsed.innerPath) return { ok: false, status: 400, error: "file_path_required" };
  const owns = await aliasOwned($i, userId, parsed.aliasId);
  if (!owns) return { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId };

  const filePath = `${sp}/aliases/${parsed.aliasId}/fileSystem/${parsed.innerPath}`;
  const text = String((await $i.db.read(filePath)) ?? "");
  const maxChars = Number(payload.maxChars || 12000);
  const offsetChars = Number(payload.offsetChars || 0);
  const content = text.slice(offsetChars, offsetChars + maxChars);
  const nextOffsetChars = offsetChars + content.length < text.length ? offsetChars + content.length : null;

  return {
    ok: true,
    action: "read",
    path: payload.path,
    absolutePath: filePath,
    mode: "text",
    content,
    totalChars: text.length,
    offsetChars,
    nextOffsetChars,
    truncated: nextOffsetChars !== null
  };
}

async function writeFile($i, userId, payload) {
  const parsed = splitOsPath(payload.path || payload.p || ".");
  if (parsed.root || !parsed.innerPath) return { ok: false, status: 400, error: "file_path_required" };
  const owns = await aliasOwned($i, userId, parsed.aliasId);
  if (!owns) return { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId };

  const filePath = `${sp}/aliases/${parsed.aliasId}/fileSystem/${parsed.innerPath}`;
  const content = payload.content || "";
  const wr = await $i.db.write(filePath, content);
  broadcastOsEvent($i, {
    type: "AWTSMOOS_OS_CHANGED",
    action: payload.action || "write",
    aliasId: parsed.aliasId,
    path: payload.path,
    innerPath: parsed.innerPath,
    at: Date.now()
  });
  return { ok: true, action: "write", path: payload.path, absolutePath: filePath, wr };
}

async function makeFolder($i, userId, payload) {
  const parsed = splitOsPath(payload.path || payload.p || ".");
  if (parsed.root || !parsed.innerPath) return { ok: false, status: 400, error: "folder_path_required" };
  const owns = await aliasOwned($i, userId, parsed.aliasId);
  if (!owns) return { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId };
  const folderPath = `${sp}/aliases/${parsed.aliasId}/fileSystem/${parsed.innerPath}`;
  const wr = await $i.db.write(folderPath);
  broadcastOsEvent($i, { type: "AWTSMOOS_OS_CHANGED", action: "makeFolder", aliasId: parsed.aliasId, path: payload.path, at: Date.now() });
  return { ok: true, action: "makeFolder", path: payload.path, absolutePath: folderPath, wr };
}

async function deletePath($i, userId, payload) {
  const parsed = splitOsPath(payload.path || payload.p || ".");
  if (parsed.root || !parsed.innerPath) return { ok: false, status: 400, error: "path_required" };
  const owns = await aliasOwned($i, userId, parsed.aliasId);
  if (!owns) return { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId };
  const fullPath = `${sp}/aliases/${parsed.aliasId}/fileSystem/${parsed.innerPath}`;
  const deleted = await $i.db.delete(fullPath);
  broadcastOsEvent($i, { type: "AWTSMOOS_OS_CHANGED", action: "delete", aliasId: parsed.aliasId, path: payload.path, at: Date.now() });
  return { ok: true, action: "delete", path: payload.path, absolutePath: fullPath, deleted };
}

function broadcastOsEvent($i, packet) {
  try {
    if (!$i.ws?.clients) return;
    const msg = JSON.stringify(packet);
    for (const client of $i.ws.clients) {
      try { client.send?.(msg); } catch (_) {}
    }
  } catch (_) {}
}

async function tree($i, userId, payload) {
  const depth = Number(payload.depth || 2);
  const limit = Number(payload.limit || 150);
  let count = 0;
  const walk = async (path, prefix, level) => {
    if (count++ >= limit) return prefix + "...limit reached\n";
    if (level > depth) return "";
    const res = await listFolder($i, userId, { ...payload, path });
    if (res.ok === false) return prefix + `[error: ${res.error}]\n`;
    let out = "";
    for (const item of res.detailedItems || []) {
      out += `${prefix}${item.name}${item.isDirectory ? "/" : ""}\n`;
      if (item.isDirectory) out += await walk(item.path, prefix + "  ", level + 1);
    }
    return out;
  };
  return { ok: true, action: "tree", path: payload.path || ".", treeText: await walk(payload.path || ".", "", 0) };
}

async function bulk($i, userId, payload) {
  const files = {};
  const paths = Array.isArray(payload.paths) ? payload.paths : [];
  for (const one of paths.slice(0, Number(payload.maxFiles || 5))) {
    const path = typeof one === "string" ? one : one.path;
    try { files[path] = await readFile($i, userId, { ...payload, path, maxChars: one.maxChars || payload.maxChars }); }
    catch (e) { files[path] = { ok: false, error: e.message }; }
  }
  return { ok: true, action: "bulk", requestedCount: paths.length, returnedCount: Object.keys(files).length, files };
}

async function bulkWrite($i, userId, payload) {
  const writes = payload.writes || (payload.files ? Object.entries(payload.files).map(([path, content]) => ({ path, content })) : []);
  const results = {};
  for (const w of writes) results[w.path] = await writeFile($i, userId, { ...payload, path: w.path, content: w.content || "" });
  return { ok: true, action: "bulkWrite", count: writes.length, results };
}

async function osFs($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);

  const payload = buildFsPayload($i);
  const neededScope = actionRequiredScope(payload.action);
  if (!identityAllows(ident, neededScope)) return json($i, { BH: "B\"H", ok: false, error: "missing_scope", neededScope }, 403);

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) return json($i, { BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, 429);

  try {
    const action = payload.action || "list";
    let result;
    if (action === "list") result = await listFolder($i, ident.userId, payload);
    else if (action === "tree") result = await tree($i, ident.userId, payload);
    else if (action === "read") result = await readFile($i, ident.userId, payload);
    else if (action === "md") {
      result = await readFile($i, ident.userId, payload);
      const ext = String(payload.path || "").split(".").pop() || "";
      result.action = "md";
      result.content = "```" + ext + "\n" + result.content + "\n```";
    }
    else if (action === "write") result = await writeFile($i, ident.userId, payload);
    else if (action === "makeFolder" || action === "mkdir") result = await makeFolder($i, ident.userId, payload);
    else if (action === "delete") result = await deletePath($i, ident.userId, payload);
    else if (action === "bulk") result = await bulk($i, ident.userId, payload);
    else if (action === "bulkWrite") result = await bulkWrite($i, ident.userId, payload);
    else result = { ok: false, status: 400, error: "unsupported_awtsmoos_os_action", action };

    recordUsage({ userId: ident.userId, keyId: ident.keyId || null, action: `awtsmoos-os:${action}`, path: payload.path, bytes: responseBytes(result), ok: result.ok !== false });
    return json($i, result, result.status || 200);
  } catch (e) {
    recordUsage({ userId: ident.userId, keyId: ident.keyId || null, action: `awtsmoos-os:${payload.action}`, path: payload.path, ok: false });
    return json($i, { BH: "B\"H", ok: false, error: e.message, stack: e.stack }, 500);
  }
}

module.exports = { osFs };
