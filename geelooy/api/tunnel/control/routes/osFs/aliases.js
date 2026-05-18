// B"H
const { stripJsonSuffix } = require("./path.js");

async function aliasOwned($i, userId, aliasId) {
  if (!aliasId) return false;
  const clean = stripJsonSuffix(aliasId);
  return await $i.db.get(`/users/${userId}/aliases/${clean}`) ||
    await $i.db.get(`/users/${userId}/aliases/${clean}.awtsmoosJSON`) ||
    await $i.db.get(`/users/${userId}/aliases/${aliasId}`);
}

async function listAliases($i, userId) {
  const got = await $i.db.get(`/users/${userId}/aliases/`, {
    pageSize: 1000,
    keepJSON: true,
    extra: true
  });
  if (Array.isArray(got)) return got;
  if (!got || typeof got !== "object") return [];
  return Object.entries(got).map(([id, value]) =>
    value && typeof value === "object" ? { ...value, aliasId: value.aliasId || id, id } : { aliasId: id, id, name: id }
  );
}

function publicAlias(alias) {
  const obj = typeof alias === "string" ? { aliasId: alias, id: alias, name: alias } : (alias || {});
  const id = stripJsonSuffix(obj.aliasId || obj.id || obj.name);
  if (!id) return null;
  return { name: id, displayName: stripJsonSuffix(obj.name || id), type: "directory", isDirectory: true, path: id, aliasId: id };
}

module.exports = { aliasOwned, listAliases, publicAlias };
