// B"H
const assert = require("assert");
const { writeFile, makeFolder, deletePath } = require("../writeOps.js");

(async () => {
  const writes = [];
  const deletes = [];
  const broadcasts = [];
  const $i = {
    db: {
      async get(path) { return path.includes("/users/user/aliases/project") ? { aliasId: "project" } : null; },
      async write(path, content) { writes.push({ path, content }); return { path, content }; },
      async delete(path) { deletes.push(path); return { path }; }
    },
    ws: { clients: [{ send(msg) { broadcasts.push(JSON.parse(msg)); } }] }
  };

  let got = await writeFile($i, "user", { path: "project/Coby/apps/demo/index.html", content: "<h1>B'H</h1>", publicOrigin: "https://example.com/" });
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.publicUrl.appPath, "/apps/demo/index.html");
  assert(got.publicUrl.candidates.includes("https://example.com/apps/demo/index.html"));
  assert.strictEqual(broadcasts.at(-1).publicUrl.appPath, "/apps/demo/index.html");
  assert(writes.at(-1).path.includes("/aliases/project/fileSystem/Coby/apps/demo/index.html"));

  got = await makeFolder($i, "user", { path: "project/Coby/apps/next" });
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.publicUrl.appPath, "/apps/next");

  got = await deletePath($i, "user", { path: "project/README.md" });
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.publicUrl.appPath, "");
  assert(deletes.at(-1).endsWith("/aliases/project/fileSystem/README.md"));

  got = await writeFile($i, "user", { path: "other/file.txt", content: "x" });
  assert.strictEqual(got.ok, false);
  assert.strictEqual(got.error, "alias_not_owned");

  console.log("BHY writeOps public URL tests passed");
})();
