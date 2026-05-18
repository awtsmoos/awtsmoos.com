// B"H
const { sp } = require("../../../../social/helper/_awtsmoos.constants.js");
const { cleanPath, dbPath, splitPath, stripJsonSuffix } = require("./path.js");
const { aliasOwned, listAliases, publicAlias } = require("./aliases.js");

function rawName(name, value) {
  if (name) return stripJsonSuffix(name);
  if (value && typeof value === "object") return stripJsonSuffix(value.name || value.id || value.path || "");
  return "";
}

function publicEntry(aliasId, base, name, value) {
  const cleanName = rawName(name, value);
  const raw = String(name || cleanName || "");
  const isDirectory = (value && typeof value === "object" && !Buffer.isBuffer(value)) || raw.endsWith(".awtsmoosJSON");
  return { name: cleanName, type: isDirectory ? "directory" : "file", isDirectory, path: [aliasId, base, cleanName].filter(Boolean).join("/"), aliasId };
}

async function listFolder($i, userId, payload) {
  const parsed = splitPath(payload.path || payload.p || ".");
  if (parsed.root) {
    const detailedItems = (await listAliases($i, userId)).map(publicAlias).filter(Boolean);
    return { ok: true, action: "list", root: "Awtsmoos OS", path: ".", items: detailedItems.map(x => x.name + "/"), detailedItems };
  }
  if (!(await aliasOwned($i, userId, parsed.aliasId))) return { ok: false, status: 403, error: "alias_not_owned", aliasId: parsed.aliasId };

  const raw = await $i.db.read(dbPath(sp, parsed.aliasId, parsed.innerPath), { pageSize: 1000, keepJSON: true, extra: true });
  const detailedItems = Array.isArray(raw)
    ? raw.map(x => typeof x === "string" ? publicEntry(parsed.aliasId, parsed.innerPath, x, null) : publicEntry(parsed.aliasId, parsed.innerPath, x.name || x.id, x))
    : raw && typeof raw === "object"
      ? Object.entries(raw).map(([name, value]) => publicEntry(parsed.aliasId, parsed.innerPath, name, value))
      : [];
  return { ok: true, action: "list", root: "Awtsmoos OS", path: cleanPath(payload.path || "."), items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name), detailedItems };
}

async function readWhole($i, userId, path) {
  const parsed = splitPath(path);
  if (parsed.root || !parsed.innerPath) throw Object.assign(new Error("file_path_required"), { status: 400 });
  if (!(await aliasOwned($i, userId, parsed.aliasId))) throw Object.assign(new Error("alias_not_owned"), { status: 403, aliasId: parsed.aliasId });
  const absolutePath = dbPath(sp, parsed.aliasId, parsed.innerPath);
  const value = await $i.db.read(absolutePath);
  const content = typeof value === "string" ? value : value == null ? "" : JSON.stringify(value, null, 2);
  return { parsed, absolutePath, content };
}

async function readFile($i, userId, payload) {
  const got = await readWhole($i, userId, payload.path || payload.p || ".");
  const maxChars = Number(payload.maxChars || 12000);
  const offsetChars = Number(payload.offsetChars || 0);
  const content = got.content.slice(offsetChars, offsetChars + maxChars);
  const nextOffsetChars = offsetChars + content.length < got.content.length ? offsetChars + content.length : null;
  return { ok: true, action: payload.action || "read", path: cleanPath(payload.path || "."), absolutePath: got.absolutePath, mode: "text", content, totalChars: got.content.length, offsetChars, nextOffsetChars, truncated: nextOffsetChars !== null };
}

module.exports = { listFolder, readWhole, readFile };
