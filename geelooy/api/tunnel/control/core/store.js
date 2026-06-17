// B"H
const fs = require("fs");
const path = require("path");
const { migrateStore } = require("./storeMigrations.js");

function dataDir() {
  return path.join(process.env.__awtsdir || process.cwd(), "geelooy", ".data");
}
function storePath() {
  return path.join(dataDir(), "tunnel-control.json");
}
function emptyStore() {
  return migrateStore({ apiKeys: {}, usage: [] });
}
function readStore() {
  try {
    return migrateStore(JSON.parse(fs.readFileSync(storePath(), "utf8")));
  } catch (e) {
    return emptyStore();
  }
}
function writeStore(store) {
  fs.mkdirSync(dataDir(), { recursive: true });
  const migrated = migrateStore(store || {});
  fs.writeFileSync(storePath(), JSON.stringify(migrated, null, 2), "utf8");
  return migrated;
}
function mutateStore(fn) {
  const store = readStore();
  const result = fn(store) || store;
  writeStore(store);
  return result;
}
module.exports = { mutateStore, readStore, writeStore };
