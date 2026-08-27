// B"H
const assert = require("assert");
const { cleanPath, cleanSegment, dbPath, decodeSafe, splitPath } = require("../path.js");

assert.strictEqual(cleanPath("alias/folder/file.txt"), "alias/folder/file.txt");
assert.strictEqual(cleanPath("/alias/folder/file.awtsmoosJSON"), "alias/folder/file");
assert.strictEqual(cleanPath("alias//folder///file.txt"), "alias/folder/file.txt");
assert.deepStrictEqual(splitPath("alias/folder/file.awtsmoosJSON"), { root: false, aliasId: "alias", innerPath: "folder/file" });
assert.strictEqual(dbPath("SP", "alias", "folder/file.txt"), "SP/aliases/alias/fileSystem/folder/file.txt");
assert.strictEqual(dbPath("SP", "alias", "."), "SP/aliases/alias/fileSystem/");
assert.strictEqual(decodeSafe("%252e%252e"), "..");
assert.throws(() => cleanPath("alias/../secret"), /virtual_os_path_escape_blocked/);
assert.throws(() => cleanPath("alias/%2e%2e/secret"), /virtual_os_path_escape_blocked/);
assert.throws(() => cleanPath("alias/%252e%252e/secret"), /virtual_os_path_escape_blocked/);
assert.throws(() => cleanPath("C:/secret"), /virtual_os_drive_or_scheme_blocked/);
assert.throws(() => cleanSegment("http:evil"), /virtual_os_drive_or_scheme_blocked/);
assert.throws(() => cleanPath("alias/a\u0000b"), /virtual_os_control_char_blocked/);
console.log("BHY path jail tests passed");
