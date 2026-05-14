
// B"H

const fs = require("fs");
const path = require("path");

function dataDir() {
  return path.join(process.env.__awtsdir || process.cwd(), "geelooy", ".data");
}

function storePath() {
  return path.join(dataDir(), "tunnel-control.json");
}

function emptyStore() {
  return {
    apiKeys: {},
    usage: []
  };
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath(), "utf8"));
  } catch (e) {
    return emptyStore();
  }
}

function writeStore(store) {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(storePath(), JSON.stringify(store, null, 2), "utf8");
  return store;
}

function mutateStore(fn) {
  const store = readStore();
  const result = fn(store) || store;
  writeStore(store);
  return result;
}

module.exports = {
  readStore,
  writeStore,
  mutateStore
};
