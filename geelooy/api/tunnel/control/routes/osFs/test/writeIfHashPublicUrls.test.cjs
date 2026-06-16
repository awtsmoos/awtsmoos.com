// B"H
const assert = require("assert");
const { writeIfHash, sha256 } = require("../writeOps.js");

(async () => {
  const db = new Map();
  const writes = [];
  const broadcasts = [];
  const fileSuffix = "/aliases/project/fileSystem/Coby/apps/hash-demo/index.html";
  const currentFor = path => db.has(path) ? db.get(path) : (String(path).endsWith(fileSuffix) ? db.get(fileSuffix) : null);
  const $i = {
    db: {
      async get(path) {
        if (path.includes("/users/user/aliases/project")) return { aliasId: "project" };
        return currentFor(path);
      },
      async read(path) { return currentFor(path); },
      async write(path, content) { writes.push({ path, content }); db.set(path, content); db.set(fileSuffix, content); return { path, content }; },
      async delete(path) { db.delete(path); return { path }; }
    },
    ws: { clients: [{ send(msg) { broadcasts.push(JSON.parse(msg)); } }] }
  };

  const path = "project/Coby/apps/hash-demo/index.html";
  db.set(fileSuffix, "old");

  let got = await writeIfHash($i, "user", { path, content: "new", expectedSha256: sha256("old"), publicOrigin: "https://example.com" });
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.action, "writeIfHash");
  assert.strictEqual(got.previousSha256, sha256("old"));
  assert.strictEqual(got.sha256, sha256("new"));
  assert.strictEqual(got.publicUrl.appPath, "/apps/hash-demo/index.html");
  assert(got.publicUrl.candidates.includes("https://example.com/apps/hash-demo/index.html"));
  assert.strictEqual(writes.at(-1).content, "new");
  assert.strictEqual(broadcasts.at(-1).publicUrl.appPath, "/apps/hash-demo/index.html");

  got = await writeIfHash($i, "user", { path, content: "bad", expectedSha256: sha256("wrong") });
  assert.strictEqual(got.ok, false);
  assert.strictEqual(got.error, "sha256_mismatch");
  assert.strictEqual(writes.at(-1).content, "new");

  console.log("BHY writeIfHash public URL tests passed");
})();
