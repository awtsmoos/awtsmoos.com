// B"H
const assert = require("assert");
const { parsePlainList } = require("../../geelooy/API/tunnel/control/routes/osFs/plainPayload.js");

const newline = "package.json\nreadme.md";
assert.deepEqual(parsePlainList(newline), ["package.json", "readme.md"]);

const csv = "a.js, b.js";
assert.deepEqual(parsePlainList(csv), ["a.js", "b.js"]);

const json = '["x.js",{"path":"y.js"}]';
assert.deepEqual(parsePlainList(json), ["x.js", { path: "y.js" }]);

console.log("B'H plain payload parsing ok");
